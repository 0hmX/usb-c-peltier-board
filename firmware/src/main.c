#include "stm32g0xx_hal.h"
#include "display.h"
#include "policy.h"
#include <stdio.h>

#define PERMISSION_PIN GPIO_PIN_2
#define DRIVER_FAULT_PIN GPIO_PIN_3
#define MINUS_PIN GPIO_PIN_4
#define SET_PIN GPIO_PIN_5
#define PLUS_PIN GPIO_PIN_6
#define PD_FAULT_PIN GPIO_PIN_7
#define I2C_TIMEOUT_MS 10u

static I2C_HandleTypeDef bus;
static ADC_HandleTypeDef adc;
static IWDG_HandleTypeDef watchdog;
static pd_settings settings;
static bool running, constant_current, display_ok, measurement_ok;
static uint16_t measured_mv, measured_ma, input_mv;
static uint8_t excessive_samples;
static const char *fault;

static void kill(void) {
  HAL_GPIO_WritePin(GPIOA, PERMISSION_PIN, GPIO_PIN_RESET);
  running = false;
  constant_current = false;
}

static void fail(const char *reason) {
  kill(); /* Independent of the I2C bus, also resets converter registers. */
  fault = reason;
}

void SysTick_Handler(void) { HAL_IncTick(); }
void HardFault_Handler(void) { kill(); while (1) {} } /* Watchdog restarts OFF. */

static bool clock_init(void) {
  RCC_OscInitTypeDef osc = {0};
  osc.OscillatorType = RCC_OSCILLATORTYPE_HSI | RCC_OSCILLATORTYPE_LSI;
  osc.HSIState = RCC_HSI_ON;
  osc.HSIDiv = RCC_HSI_DIV1;
  osc.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;
  osc.LSIState = RCC_LSI_ON;
  osc.PLL.PLLState = RCC_PLL_NONE;
  if (HAL_RCC_OscConfig(&osc) != HAL_OK) return false;
  RCC_ClkInitTypeDef clocks = {0};
  clocks.ClockType = RCC_CLOCKTYPE_SYSCLK | RCC_CLOCKTYPE_HCLK | RCC_CLOCKTYPE_PCLK1;
  clocks.SYSCLKSource = RCC_SYSCLKSOURCE_HSI;
  clocks.AHBCLKDivider = RCC_SYSCLK_DIV1;
  clocks.APB1CLKDivider = RCC_HCLK_DIV1;
  return HAL_RCC_ClockConfig(&clocks, FLASH_LATENCY_0) == HAL_OK;
}

static void gpio_init(void) {
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOB_CLK_ENABLE();
  __HAL_RCC_SYSCFG_CLK_ENABLE();
  /* LOW is the safe state. A 100k pull-down keeps the release MOSFET OFF
   * during reset; an independent AUX_5V pull-up asserts the NPN kill. */
  HAL_GPIO_WritePin(GPIOA, PERMISSION_PIN, GPIO_PIN_RESET);
  GPIO_InitTypeDef pin = {0};
  pin.Pin = PERMISSION_PIN; pin.Mode = GPIO_MODE_OUTPUT_PP; pin.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOA, &pin);
  pin.Pin = DRIVER_FAULT_PIN | MINUS_PIN | SET_PIN | PLUS_PIN;
  pin.Mode = GPIO_MODE_INPUT; pin.Pull = GPIO_PULLUP;
  HAL_GPIO_Init(GPIOA, &pin);
  /* Push-pull PD output through 10k: an internal pull-down could attenuate HIGH. */
  pin.Pin = PD_FAULT_PIN; pin.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(GPIOA, &pin);
  pin.Pin = GPIO_PIN_0 | GPIO_PIN_1; pin.Mode = GPIO_MODE_ANALOG; pin.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(GPIOA, &pin);
  /* PB7 and PB8 share physical pin1. Keep both analog; ADC uses PB7/IN11. */
  pin.Pin = GPIO_PIN_7 | GPIO_PIN_8;
  HAL_GPIO_Init(GPIOB, &pin);
  /* TSSOP20 defaults to PA11/12. Remapping would select PA9/10 instead. */
  HAL_SYSCFG_DisableRemap(SYSCFG_REMAP_PA11 | SYSCFG_REMAP_PA12);
  pin.Pin = GPIO_PIN_11 | GPIO_PIN_12;
  pin.Mode = GPIO_MODE_AF_OD; pin.Alternate = GPIO_AF6_I2C2;
  pin.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOA, &pin);
}

static bool peripherals_init(void) {
  __HAL_RCC_I2C2_CLK_ENABLE();
  bus.Instance = I2C2;
  /* 16 MHz PCLK, <=100 kHz, conservative rise/setup allowance. Verify on PCB. */
  bus.Init.Timing = 0x10921F27;
  bus.Init.AddressingMode = I2C_ADDRESSINGMODE_7BIT;
  bus.Init.DualAddressMode = I2C_DUALADDRESS_DISABLE;
  bus.Init.OwnAddress2Masks = I2C_OA2_NOMASK;
  bus.Init.GeneralCallMode = I2C_GENERALCALL_DISABLE;
  bus.Init.NoStretchMode = I2C_NOSTRETCH_DISABLE;
  if (HAL_I2C_Init(&bus) != HAL_OK ||
      HAL_I2CEx_ConfigAnalogFilter(&bus, I2C_ANALOGFILTER_ENABLE) != HAL_OK ||
      HAL_I2CEx_ConfigDigitalFilter(&bus, 0) != HAL_OK) return false;
  __HAL_RCC_ADC_CLK_ENABLE();
  adc.Instance = ADC1;
  adc.Init.ClockPrescaler = ADC_CLOCK_SYNC_PCLK_DIV2;
  adc.Init.Resolution = ADC_RESOLUTION_12B;
  adc.Init.DataAlign = ADC_DATAALIGN_RIGHT;
  adc.Init.ScanConvMode = ADC_SCAN_DISABLE;
  adc.Init.EOCSelection = ADC_EOC_SINGLE_CONV;
  adc.Init.NbrOfConversion = 1;
  adc.Init.ExternalTrigConv = ADC_SOFTWARE_START;
  adc.Init.ExternalTrigConvEdge = ADC_EXTERNALTRIGCONVEDGE_NONE;
  adc.Init.Overrun = ADC_OVR_DATA_OVERWRITTEN;
  adc.Init.SamplingTimeCommon1 = ADC_SAMPLETIME_160CYCLES_5;
  adc.Init.SamplingTimeCommon2 = ADC_SAMPLETIME_160CYCLES_5;
  return HAL_ADC_Init(&adc) == HAL_OK && HAL_ADCEx_Calibration_Start(&adc) == HAL_OK;
}

static bool adc_read(uint32_t channel, uint16_t *value) {
  ADC_ChannelConfTypeDef config = {0};
  config.Channel = channel; config.Rank = ADC_REGULAR_RANK_1;
  config.SamplingTime = ADC_SAMPLINGTIME_COMMON_1;
  if (HAL_ADC_ConfigChannel(&adc, &config) != HAL_OK) return false;
  if (channel == ADC_CHANNEL_VREFINT) HAL_Delay(1); /* Internal reference stabilization. */
  if (HAL_ADC_Start(&adc) != HAL_OK || HAL_ADC_PollForConversion(&adc, 5) != HAL_OK) {
    HAL_ADC_Stop(&adc); return false;
  }
  *value = (uint16_t)HAL_ADC_GetValue(&adc);
  return HAL_ADC_Stop(&adc) == HAL_OK;
}

static bool measure(void) {
  uint16_t reference, voltage, current, input;
  if (!adc_read(ADC_CHANNEL_VREFINT, &reference) || reference == 0 ||
      !adc_read(ADC_CHANNEL_1, &voltage) || !adc_read(ADC_CHANNEL_0, &current) ||
      !adc_read(ADC_CHANNEL_11, &input)) return false;
  uint32_t supply_mv = __HAL_ADC_CALC_VREFANALOG_VOLTAGE(reference, ADC_RESOLUTION_12B);
  if (supply_mv < 2800 || supply_mv > 3600) return false;
  measured_mv = (uint16_t)((uint32_t)voltage * supply_mv * 6u / 4095u);
  measured_ma = (uint16_t)((uint32_t)current * supply_mv * 5u / 4095u);
  input_mv = (uint16_t)((uint32_t)input * supply_mv * 172u / (4095u * 22u));
  return true;
}

static bool pd_ready(void) {
  return measurement_ok && input_mv >= 18000u && input_mv <= 22000u &&
         HAL_GPIO_ReadPin(GPIOA, PD_FAULT_PIN) == GPIO_PIN_RESET;
}

static bool driver_read(uint8_t reg, uint8_t *value) {
  return HAL_I2C_Mem_Read(&bus, TPS_ADDRESS << 1, reg, I2C_MEMADD_SIZE_8BIT,
                          value, 1, I2C_TIMEOUT_MS) == HAL_OK;
}

static bool driver_write_verified(uint8_t reg, uint8_t value) {
  uint8_t observed;
  return HAL_I2C_Mem_Write(&bus, TPS_ADDRESS << 1, reg, I2C_MEMADD_SIZE_8BIT,
                           &value, 1, I2C_TIMEOUT_MS) == HAL_OK &&
         driver_read(reg, &observed) && observed == value;
}

static void start_output(void) {
  kill(); HAL_Delay(2); /* EN low resets the converter; OE defaults to zero. */
  measurement_ok = measure();
  if (!pd_ready()) { fail("PD"); return; }
  if (!display_ok) { fail("DISPLAY"); return; }
  if (!pd_valid(&settings)) { fail("SETTINGS"); return; }
  /* I2C is disabled while EN is low. Release hardware kill with OE reset OFF. */
  HAL_GPIO_WritePin(GPIOA, PERMISSION_PIN, GPIO_PIN_SET);
  HAL_Delay(5);
  uint16_t ref = pd_reference_code(settings.voltage_mv);
  if (!driver_write_verified(6, TPS_MODE_OFF) ||
      !driver_write_verified(4, TPS_INTERNAL_FB) ||
      !driver_write_verified(0, (uint8_t)ref) ||
      !driver_write_verified(1, (uint8_t)(ref >> 8)) ||
      !driver_write_verified(2, pd_current_code(settings.current_ma)) ||
      !driver_write_verified(3, 0x00) || /* Slow slew, shortest 128 us current-limit delay. */
      !driver_write_verified(5, TPS_CDC_FAULTS)) { fail("BUS"); return; }
  uint8_t status;
  measurement_ok = measure();
  if (!pd_ready()) { fail("PD"); return; }
  if (!driver_read(7, &status)) { fail("BUS"); return; }
  if (status & TPS_FATAL_STATUS) { fail("LOAD"); return; }
  /* OE is the final write, after every setting has been read back. */
  if (!driver_write_verified(6, TPS_MODE_ON)) { fail("BUS"); return; }
  running = true; fault = NULL; constant_current = false; excessive_samples = 0;
}

static void stop_output(void) {
  if (!driver_write_verified(6, TPS_MODE_OFF)) { fail("BUS"); return; }
  /* Retain EN for the converter's 100 mA output discharge while OE stays OFF. */
  running = false; constant_current = false; fault = NULL;
}

static void check_output(void) {
  if (!pd_ready()) { fail("PD"); return; }
  if (HAL_GPIO_ReadPin(GPIOA, DRIVER_FAULT_PIN) == GPIO_PIN_RESET) {
    fail("LOAD"); return;
  }
  uint8_t status, mode;
  if (!driver_read(7, &status) || !driver_read(6, &mode)) { fail("BUS"); return; }
  if ((status & TPS_FATAL_STATUS) || mode != TPS_MODE_ON) { fail("LOAD"); return; }
  constant_current = (status & 0x40u) != 0;
  /* Supplemental approximate ADC check; converter performs the actual CC loop. */
  if (measured_mv > settings.voltage_mv + 600u || measured_ma > settings.current_ma + 600u) {
    if (++excessive_samples >= 3) fail("LIMIT");
  } else excessive_samples = 0;
}

static void buttons(void) {
  static uint16_t stable, candidate;
  static uint32_t changed, pressed, repeat_at;
  static bool held;
  uint32_t now = HAL_GetTick();
  uint16_t raw = (uint16_t)(~GPIOA->IDR) & (MINUS_PIN | SET_PIN | PLUS_PIN);
  if (raw != candidate) { candidate = raw; changed = now; }
  if (raw != stable && now - changed >= 20) {
    uint16_t previous = stable; stable = raw;
    repeat_at = now + 500u;
    if ((stable & SET_PIN) && !(previous & SET_PIN)) {
      pressed = now; held = false;
      if (running) { stop_output(); held = true; } /* A press stops immediately. */
    }
    if (!(stable & SET_PIN) && (previous & SET_PIN) && !held && !running)
      settings.edit_current = !settings.edit_current;
    if (!running && !(stable & SET_PIN)) {
      if ((stable & PLUS_PIN) && !(previous & PLUS_PIN) && !(stable & MINUS_PIN)) pd_adjust(&settings, 1);
      if ((stable & MINUS_PIN) && !(previous & MINUS_PIN) && !(stable & PLUS_PIN)) pd_adjust(&settings, -1);
    }
  }
  if (!running && !(stable & SET_PIN) &&
      (stable == PLUS_PIN || stable == MINUS_PIN) && (int32_t)(now - repeat_at) >= 0) {
    pd_adjust(&settings, stable == PLUS_PIN ? 1 : -1);
    repeat_at = now + 100u;
  }
  if ((stable & SET_PIN) && !held && now - pressed >= 800) {
    held = true;
    start_output();
  }
}

static bool show(void) {
  char state[22], limits[22], actual[22], action[22];
  if (fault) snprintf(state, sizeof state, "OFF FAULT %s", fault);
  else snprintf(state, sizeof state, running ? (constant_current ? "RUN CC" : "RUN CV") :
                (settings.edit_current ? "OFF EDIT I" : "OFF EDIT V"));
  snprintf(limits, sizeof limits, "V %u.%u I %u.%02u", settings.voltage_mv / 1000u,
           settings.voltage_mv % 1000u / 100u, settings.current_ma / 1000u,
           settings.current_ma % 1000u / 10u);
  snprintf(actual, sizeof actual, "~%u.%uV %u.%02uA", measured_mv / 1000u,
           measured_mv % 1000u / 100u, measured_ma / 1000u, measured_ma % 1000u / 10u);
  if (!pd_ready()) snprintf(action, sizeof action, "PD NEED 100W 5A CABLE");
  else snprintf(action, sizeof action, running ? "PRESS SET TO STOP" : "HOLD SET TO RUN");
  const char *lines[] = {state, limits, actual, action};
  return display_lines(&bus, lines);
}

int main(void) {
  HAL_Init(); gpio_init(); kill();
  if (!clock_init()) while (1) {} /* Hardware kill remains asserted. */
  watchdog.Instance = IWDG;
  watchdog.Init.Prescaler = IWDG_PRESCALER_32;
  watchdog.Init.Reload = 499; watchdog.Init.Window = IWDG_WINDOW_DISABLE;
  if (HAL_IWDG_Init(&watchdog) != HAL_OK) while (1) {}
  if (!peripherals_init()) while (1) {} /* Watchdog restarts with hardware kill. */
  pd_defaults(&settings);
  display_ok = display_init(&bus);
  uint32_t last_display = HAL_GetTick() - 250u;
  while (1) {
    measurement_ok = measure();
    if (!measurement_ok) fail("ADC");
    if (running) check_output();
    buttons();
    uint32_t now = HAL_GetTick();
    if (now - last_display >= 250u) {
      if (!display_ok) display_ok = display_init(&bus);
      display_ok = display_ok && show();
      if (!display_ok) fail("DISPLAY");
      last_display = now;
    }
    HAL_IWDG_Refresh(&watchdog);
    HAL_Delay(10);
  }
}
