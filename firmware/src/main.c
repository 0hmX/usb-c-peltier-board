#include "stm32g0xx_hal.h"
#include "tusb.h"
#include "command.h"
#include "profile.h"
#include "session.h"
#include <stdio.h>
#include <string.h>

#define PERMISSION_PIN GPIO_PIN_0 /* PB0 is unused by every ROM boot interface. */
#define RUN_LED_PIN GPIO_PIN_1
#define FAULT_LED_PIN GPIO_PIN_2
#define USB_PRESENT_PIN GPIO_PIN_4
#define DRIVER_FAULT_PIN GPIO_PIN_5
#define PD_FAULT_PIN GPIO_PIN_7
#define BOOT_MAGIC 0x44465531u
#define FAULT_MAGIC 0x53414645u
#define I2C_TIMEOUT_MS 10u

static I2C_HandleTypeDef bus;
static ADC_HandleTypeDef adc;
static IWDG_HandleTypeDef watchdog;
static pd_settings settings, saved_settings;
static pd_session session;
static bool running, constant_current, measurement_ok, saved_valid, usb_started, usb_attached;
static uint16_t measured_mv, measured_ma, input_mv;
static uint8_t excessive_samples;
static const char *fault;
static uint32_t boot_deadline;
static bool boot_pending;
static volatile uint32_t boot_request __attribute__((section(".noinit")));
static volatile uint32_t fault_latch __attribute__((section(".noinit")));

static void kill(void) {
  HAL_GPIO_WritePin(GPIOB, PERMISSION_PIN | RUN_LED_PIN, GPIO_PIN_RESET);
  running = false; constant_current = false;
}
static void fail(const char *reason, bool protective) {
  kill(); fault = reason; pd_session_fault(&session, protective);
  if (protective) fault_latch = FAULT_MAGIC;
  HAL_GPIO_WritePin(GPIOB, FAULT_LED_PIN, GPIO_PIN_SET);
}
void SysTick_Handler(void) { HAL_IncTick(); }
void USB_UCPD1_2_IRQHandler(void) { tud_int_handler(0); }
void HardFault_Handler(void) { kill(); fault_latch = FAULT_MAGIC; while (1) {} }

static void early_boot(void) {
  __HAL_RCC_GPIOB_CLK_ENABLE();
  GPIOB->BSRR = (uint32_t)PERMISSION_PIN << 16;
  MODIFY_REG(GPIOB->MODER, GPIO_MODER_MODE0, GPIO_MODER_MODE0_0);
  bool power_reset = __HAL_RCC_GET_FLAG(RCC_FLAG_PWRRST) != RESET;
  bool requested = !power_reset && __HAL_RCC_GET_FLAG(RCC_FLAG_SFTRST) != RESET && boot_request == BOOT_MAGIC;
  boot_request = 0;
  if (power_reset) fault_latch = 0;
  if (__HAL_RCC_GET_FLAG(RCC_FLAG_IWDGRST) != RESET || __HAL_RCC_GET_FLAG(RCC_FLAG_WWDGRST) != RESET)
    fault_latch = FAULT_MAGIC;
  __HAL_RCC_CLEAR_RESET_FLAGS();
  if (!requested) return;
  /* Fresh reset clocks; PB0 remains LOW. AN2606 G0B1 system-memory vectors. */
  const uint32_t *rom = (const uint32_t *)0x1FFF0000u;
  __disable_irq();
  SysTick->CTRL = 0; SysTick->LOAD = 0; SysTick->VAL = 0;
  NVIC->ICER[0] = 0xFFFFFFFFu; NVIC->ICPR[0] = 0xFFFFFFFFu;
  SCB->VTOR = 0x1FFF0000u;
  __set_CONTROL(0); __DSB(); __ISB();
  __asm volatile("msr msp, %0\n cpsie i\n bx %1" : : "r"(rom[0]), "r"(rom[1]) : "memory");
  __builtin_unreachable();
}

static bool clock_init(void) {
  __HAL_RCC_PWR_CLK_ENABLE();
  RCC_OscInitTypeDef osc = {0};
  osc.OscillatorType = RCC_OSCILLATORTYPE_HSI | RCC_OSCILLATORTYPE_LSI | RCC_OSCILLATORTYPE_HSI48;
  osc.HSIState = RCC_HSI_ON; osc.HSIDiv = RCC_HSI_DIV1;
  osc.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;
  osc.LSIState = RCC_LSI_ON; osc.HSI48State = RCC_HSI48_ON; osc.PLL.PLLState = RCC_PLL_NONE;
  if (HAL_RCC_OscConfig(&osc) != HAL_OK) return false;
  RCC_ClkInitTypeDef clocks = {0};
  clocks.ClockType = RCC_CLOCKTYPE_SYSCLK | RCC_CLOCKTYPE_HCLK | RCC_CLOCKTYPE_PCLK1;
  clocks.SYSCLKSource = RCC_SYSCLKSOURCE_HSI;
  clocks.AHBCLKDivider = RCC_SYSCLK_DIV1; clocks.APB1CLKDivider = RCC_HCLK_DIV1;
  if (HAL_RCC_ClockConfig(&clocks, FLASH_LATENCY_0) != HAL_OK) return false;
  RCC_PeriphCLKInitTypeDef usb_clock = {0};
  usb_clock.PeriphClockSelection = RCC_PERIPHCLK_USB; usb_clock.UsbClockSelection = RCC_USBCLKSOURCE_HSI48;
  if (HAL_RCCEx_PeriphCLKConfig(&usb_clock) != HAL_OK) return false;
  __HAL_RCC_CRS_CLK_ENABLE();
  RCC_CRSInitTypeDef crs = {0};
  crs.Prescaler = RCC_CRS_SYNC_DIV1; crs.Source = RCC_CRS_SYNC_SOURCE_USB;
  crs.Polarity = RCC_CRS_SYNC_POLARITY_RISING;
  crs.ReloadValue = __HAL_RCC_CRS_RELOADVALUE_CALCULATE(48000000, 1000);
  crs.ErrorLimitValue = 34; crs.HSI48CalibrationValue = 32;
  HAL_RCCEx_CRSConfig(&crs);
  return true;
}

static void gpio_init(void) {
  __HAL_RCC_GPIOA_CLK_ENABLE(); __HAL_RCC_GPIOB_CLK_ENABLE(); __HAL_RCC_SYSCFG_CLK_ENABLE();
  HAL_GPIO_WritePin(GPIOB, PERMISSION_PIN | RUN_LED_PIN | FAULT_LED_PIN, GPIO_PIN_RESET);
  GPIO_InitTypeDef pin = {0};
  pin.Pin = PERMISSION_PIN | RUN_LED_PIN | FAULT_LED_PIN;
  pin.Mode = GPIO_MODE_OUTPUT_PP; pin.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOB, &pin);
  pin.Pin = DRIVER_FAULT_PIN; pin.Mode = GPIO_MODE_INPUT; pin.Pull = GPIO_PULLUP;
  HAL_GPIO_Init(GPIOA, &pin);
  pin.Pin = PD_FAULT_PIN | USB_PRESENT_PIN; pin.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(GPIOA, &pin);
  pin.Pin = GPIO_PIN_0 | GPIO_PIN_1 | GPIO_PIN_3; pin.Mode = GPIO_MODE_ANALOG;
  HAL_GPIO_Init(GPIOA, &pin);
  HAL_SYSCFG_DisableRemap(SYSCFG_REMAP_PA11 | SYSCFG_REMAP_PA12);
  pin.Pin = GPIO_PIN_11 | GPIO_PIN_12; pin.Mode = GPIO_MODE_INPUT;
  HAL_GPIO_Init(GPIOA, &pin);
  pin.Pin = GPIO_PIN_6 | GPIO_PIN_7; pin.Mode = GPIO_MODE_AF_OD;
  pin.Alternate = GPIO_AF6_I2C1;
  HAL_GPIO_Init(GPIOB, &pin);
}

static bool peripherals_init(void) {
  __HAL_RCC_I2C1_CLK_ENABLE();
  bus.Instance = I2C1; bus.Init.Timing = 0x10921F27; /* 16 MHz PCLK, approximately 100 kHz. */
  bus.Init.AddressingMode = I2C_ADDRESSINGMODE_7BIT;
  bus.Init.DualAddressMode = I2C_DUALADDRESS_DISABLE; bus.Init.OwnAddress2Masks = I2C_OA2_NOMASK;
  bus.Init.GeneralCallMode = I2C_GENERALCALL_DISABLE; bus.Init.NoStretchMode = I2C_NOSTRETCH_DISABLE;
  if (HAL_I2C_Init(&bus) != HAL_OK || HAL_I2CEx_ConfigAnalogFilter(&bus, I2C_ANALOGFILTER_ENABLE) != HAL_OK ||
      HAL_I2CEx_ConfigDigitalFilter(&bus, 0) != HAL_OK) return false;
  __HAL_RCC_ADC_CLK_ENABLE();
  adc.Instance = ADC1; adc.Init.ClockPrescaler = ADC_CLOCK_SYNC_PCLK_DIV2;
  adc.Init.Resolution = ADC_RESOLUTION_12B; adc.Init.DataAlign = ADC_DATAALIGN_RIGHT;
  adc.Init.ScanConvMode = ADC_SCAN_DISABLE; adc.Init.EOCSelection = ADC_EOC_SINGLE_CONV;
  adc.Init.NbrOfConversion = 1; adc.Init.ExternalTrigConv = ADC_SOFTWARE_START;
  adc.Init.ExternalTrigConvEdge = ADC_EXTERNALTRIGCONVEDGE_NONE; adc.Init.Overrun = ADC_OVR_DATA_OVERWRITTEN;
  adc.Init.SamplingTimeCommon1 = ADC_SAMPLETIME_160CYCLES_5;
  adc.Init.SamplingTimeCommon2 = ADC_SAMPLETIME_160CYCLES_5;
  if (HAL_ADC_Init(&adc) != HAL_OK || HAL_ADCEx_Calibration_Start(&adc) != HAL_OK) return false;
  __HAL_RCC_USB_CLK_ENABLE(); HAL_PWREx_EnableVddUSB();
  HAL_NVIC_SetPriority(USB_UCPD1_2_IRQn, 1, 0); HAL_NVIC_EnableIRQ(USB_UCPD1_2_IRQn);
  return true;
}
static bool adc_read(uint32_t channel, uint16_t *value) {
  ADC_ChannelConfTypeDef config = {0};
  config.Channel = channel; config.Rank = ADC_REGULAR_RANK_1; config.SamplingTime = ADC_SAMPLINGTIME_COMMON_1;
  if (HAL_ADC_ConfigChannel(&adc, &config) != HAL_OK) return false;
  if (channel == ADC_CHANNEL_VREFINT) HAL_Delay(1);
  if (HAL_ADC_Start(&adc) != HAL_OK || HAL_ADC_PollForConversion(&adc, 5) != HAL_OK) {
    HAL_ADC_Stop(&adc); return false;
  }
  *value = (uint16_t)HAL_ADC_GetValue(&adc);
  return HAL_ADC_Stop(&adc) == HAL_OK;
}
static bool measure(void) {
  uint16_t reference, voltage, current, input;
  if (!adc_read(ADC_CHANNEL_VREFINT, &reference) || !reference || !adc_read(ADC_CHANNEL_1, &voltage) ||
      !adc_read(ADC_CHANNEL_0, &current) || !adc_read(ADC_CHANNEL_3, &input)) return false;
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
  return HAL_I2C_Mem_Read(&bus, TPS_ADDRESS << 1, reg, I2C_MEMADD_SIZE_8BIT, value, 1, I2C_TIMEOUT_MS) == HAL_OK;
}
static bool driver_write_verified(uint8_t reg, uint8_t value) {
  uint8_t observed;
  return HAL_I2C_Mem_Write(&bus, TPS_ADDRESS << 1, reg, I2C_MEMADD_SIZE_8BIT, &value, 1, I2C_TIMEOUT_MS) == HAL_OK &&
         driver_read(reg, &observed) && observed == value;
}
static void start_output(void) {
  kill(); pd_session_cancel(&session); HAL_Delay(2); /* EN low resets OE to zero. */
  measurement_ok = measure();
  if (!measurement_ok) { fail("ADC", true); return; }
  if (!pd_ready()) { fail("PD", false); return; }
  if (!pd_valid(&settings)) { fail("SETTINGS", true); return; }
  HAL_GPIO_WritePin(GPIOB, PERMISSION_PIN, GPIO_PIN_SET); HAL_Delay(5);
  uint16_t ref = pd_reference_code(settings.voltage_mv);
  if (!driver_write_verified(6, TPS_MODE_OFF) || !driver_write_verified(4, TPS_INTERNAL_FB) ||
      !driver_write_verified(0, (uint8_t)ref) || !driver_write_verified(1, (uint8_t)(ref >> 8)) ||
      !driver_write_verified(2, pd_current_code(settings.current_ma)) || !driver_write_verified(3, 0x00) ||
      !driver_write_verified(5, TPS_CDC_FAULTS)) { fail("BUS", true); return; }
  uint8_t status;
  measurement_ok = measure();
  if (!measurement_ok) { fail("ADC", true); return; }
  if (!pd_ready()) { fail("PD", false); return; }
  if (!driver_read(7, &status)) { fail("BUS", true); return; }
  if (status & TPS_FATAL_STATUS) { fail("LOAD", true); return; }
  if (!driver_write_verified(6, TPS_MODE_ON)) { fail("BUS", true); return; }
  running = true; fault = NULL; constant_current = false; excessive_samples = 0;
  pd_session_clear(&session); fault_latch = 0;
  HAL_GPIO_WritePin(GPIOB, RUN_LED_PIN, GPIO_PIN_SET);
  HAL_GPIO_WritePin(GPIOB, FAULT_LED_PIN, GPIO_PIN_RESET);
}
static void stop_output(void) {
  pd_session_cancel(&session);
  if (running && !driver_write_verified(6, TPS_MODE_OFF)) { fail("BUS", true); return; }
  /* Retain EN after a healthy RUN for 100 mA output discharge. */
  running = false; constant_current = false;
  HAL_GPIO_WritePin(GPIOB, RUN_LED_PIN, GPIO_PIN_RESET);
}
static void check_output(void) {
  if (!pd_ready()) { fail("PD", false); return; }
  if (HAL_GPIO_ReadPin(GPIOA, DRIVER_FAULT_PIN) == GPIO_PIN_RESET) { fail("LOAD", true); return; }
  uint8_t status, mode;
  if (!driver_read(7, &status) || !driver_read(6, &mode)) { fail("BUS", true); return; }
  if ((status & TPS_FATAL_STATUS) || mode != TPS_MODE_ON) { fail("LOAD", true); return; }
  constant_current = (status & 0x40u) != 0;
  if (measured_mv > settings.voltage_mv + 600u || measured_ma > settings.current_ma + 600u) {
    if (++excessive_samples >= 3) fail("LIMIT", true);
  } else excessive_samples = 0;
}
static bool factory_ready(void) {
  uint32_t mask = FLASH_OPTR_IWDG_SW | FLASH_OPTR_nBOOT_SEL | FLASH_OPTR_nBOOT1;
  return (FLASH->OPTR & mask) == FLASH_OPTR_nBOOT1 && !(FLASH->SECR & FLASH_SECR_BOOT_LOCK);
}
static bool storage_layout_valid(void) {
  return FLASH_SIZE == 128u * 1024u && FLASH_PAGE_SIZE == 2048u &&
         (FLASH_BANK_NB == 1u || (FLASH->OPTR & FLASH_OPTR_nSWAP_BANK));
}
static bool save_profile(void) {
  if (running || !storage_layout_valid()) return false;
  pd_profile record; pd_profile_make(&record, &settings);
  const pd_profile *stored = (const pd_profile *)PD_PROFILE_ADDRESS;
  if (saved_valid && memcmp(&record, stored, sizeof record) == 0) return true;
  kill(); pd_session_cancel(&session); saved_valid = false;
  if (HAL_FLASH_Unlock() != HAL_OK) return false;
  FLASH_EraseInitTypeDef erase = {0};
  erase.TypeErase = FLASH_TYPEERASE_PAGES;
  erase.Banks = FLASH_BANK_NB > 1u ? FLASH_BANK_2 : FLASH_BANK_1;
  erase.Page = FLASH_PAGE_NB - 1u; erase.NbPages = 1;
  uint32_t page_error;
  bool ok = HAL_FLASHEx_Erase(&erase, &page_error) == HAL_OK;
  for (unsigned offset = 0; ok && offset < sizeof record; offset += 8) {
    uint64_t word; memcpy(&word, (const uint8_t *)&record + offset, sizeof word);
    ok = HAL_FLASH_Program(FLASH_TYPEPROGRAM_DOUBLEWORD, PD_PROFILE_ADDRESS + offset, word) == HAL_OK;
  }
  ok = HAL_FLASH_Lock() == HAL_OK && ok;
  saved_valid = ok && memcmp(&record, stored, sizeof record) == 0 && pd_profile_read(stored, &saved_settings);
  return saved_valid;
}
static void reply(const char *text) { tud_cdc_write_str(text); tud_cdc_write_str("\r\n"); tud_cdc_write_flush(); }
static void status(void) {
  char response[256];
  snprintf(response, sizeof response,
    "{\"run\":%u,\"cc\":%u,\"pd\":%u,\"fault\":\"%s\",\"set_mv\":%u,\"limit_ma\":%u,\"approx_mv\":%u,\"approx_ma\":%u,\"input_mv\":%u,\"saved\":%u,\"dfu_ready\":%u}",
    (unsigned)running, (unsigned)constant_current, (unsigned)pd_ready(), fault ? fault : "NONE",
    (unsigned)settings.voltage_mv, (unsigned)settings.current_ma, (unsigned)measured_mv,
    (unsigned)measured_ma, (unsigned)input_mv, (unsigned)saved_valid, (unsigned)factory_ready());
  reply(response);
}
static void command(const char *line) {
  pd_command c;
  if (!pd_parse_command(line, &c)) { reply("ERR COMMAND_OR_LIMITS"); return; }
  switch (c.kind) {
  case CMD_SET:
    if (running) { reply("ERR STOP_FIRST"); return; }
    pd_set(&settings, c.voltage_mv, c.current_ma); pd_session_cancel(&session);
    reply("OK SET"); break;
  case CMD_RUN: if (!running) start_output(); reply(running ? "OK RUN" : "ERR RUN_CHECK_STATUS"); break;
  case CMD_STOP: stop_output(); reply(running ? "ERR STOP" : "OK STOP"); break;
  case CMD_SAVE:
    if (running) reply("ERR STOP_FIRST");
    else {
      pd_session_cancel(&session);
      bool ok = save_profile(); if (!ok) fail("SAVE", true);
      reply(ok ? "OK SAVE" : "ERR SAVE");
    }
    break;
  case CMD_CLEAR:
    kill(); pd_session_clear(&session); fault_latch = 0; fault = NULL;
    HAL_GPIO_WritePin(GPIOB, FAULT_LED_PIN, GPIO_PIN_RESET); reply("OK CLEAR"); break;
  case CMD_STATUS: status(); break;
  case CMD_BOOT:
    kill(); pd_session_cancel(&session);
    if (!factory_ready()) { reply("ERR DFU_FACTORY_OPTIONS"); return; }
    reply("OK BOOT"); boot_pending = true; boot_deadline = HAL_GetTick() + 50u; break;
  case CMD_HELP: reply("SET <mV> <mA> | SAVE | RUN | STOP | STATUS | CLEAR | BOOT"); break;
  default: reply("ERR COMMAND"); break;
  }
}
static void usb_task(void) {
  static char line[64]; static unsigned length; static bool overflow;
  bool present = HAL_GPIO_ReadPin(GPIOA, USB_PRESENT_PIN) == GPIO_PIN_SET;
  if (present && !usb_started) {
    tusb_rhport_init_t init = {.role = TUSB_ROLE_DEVICE, .speed = TUSB_SPEED_FULL};
    usb_started = tusb_init(0, &init); usb_attached = usb_started;
  } else if (usb_started && present != usb_attached) {
    if (present) tud_connect(); else tud_disconnect();
    usb_attached = present;
  }
  if (!present) { length = 0; overflow = false; }
  if (!usb_started) return;
  tud_task();
  /* Programming-port detach does not change qualified PD operation. */
  if (!present || !tud_cdc_connected()) { length = 0; overflow = false; return; }
  if (tud_cdc_write_available() < 256u || boot_pending) return;
  unsigned budget = 64;
  while (budget-- && tud_cdc_available()) {
    char ch; tud_cdc_read(&ch, 1);
    if (ch == '\r' || ch == '\n') {
      if (!length && !overflow) continue;
      if (overflow) reply("ERR LINE_TOO_LONG"); else { line[length] = 0; command(line); }
      length = 0; overflow = false; break;
    }
    if (ch >= 'a' && ch <= 'z') ch = (char)(ch - 'a' + 'A');
    if (ch < ' ' && ch != '\t') { overflow = true; continue; }
    if (length < sizeof line - 1) line[length++] = ch; else overflow = true;
  }
}

int main(void) {
  early_boot(); HAL_Init(); gpio_init(); kill();
  if (!clock_init()) while (1) {}
  watchdog.Instance = IWDG; watchdog.Init.Prescaler = IWDG_PRESCALER_32;
  watchdog.Init.Reload = 499; watchdog.Init.Window = IWDG_WINDOW_DISABLE;
  if (HAL_IWDG_Init(&watchdog) != HAL_OK || !peripherals_init()) while (1) {}
  pd_defaults(&settings); saved_valid = storage_layout_valid() &&
    pd_profile_read((const pd_profile *)PD_PROFILE_ADDRESS, &saved_settings);
  if (saved_valid) settings = saved_settings;
  bool latched = fault_latch == FAULT_MAGIC;
  pd_session_init(&session, saved_valid, latched);
  if (latched) { fault = "RESET_OR_PROTECTION"; HAL_GPIO_WritePin(GPIOB, FAULT_LED_PIN, GPIO_PIN_SET); }
  while (1) {
    measurement_ok = measure();
    if (!measurement_ok) fail("ADC", true);
    if (running) check_output();
    usb_task();
    if (boot_pending && (int32_t)(HAL_GetTick() - boot_deadline) >= 0) {
      kill(); HAL_IWDG_Refresh(&watchdog); boot_request = BOOT_MAGIC; __DSB(); NVIC_SystemReset();
    }
    if (!boot_pending && pd_session_tick(&session, pd_ready(), saved_valid, HAL_GetTick())) {
      settings = saved_settings; start_output();
    }
    HAL_IWDG_Refresh(&watchdog); HAL_Delay(10);
  }
}
