# Driver firmware

The application uses ST's official STM32CubeG0 HAL/CMSIS. PlatformIO downloads the pinned SDK and ARM GCC packages instead of vendoring them. Target: **STM32G030F6P6, 32 KB flash / 8 KB RAM**, internal 16 MHz HSI clock, no crystal. The application cross-builds, but the unrouted prototype has not been flashed or bench-tested.

From this directory:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/pio run
```

The build produces `.pio/build/general-pd/firmware.bin` and `firmware.elf`. Flash using an ST-LINK connected to the board's labeled 3V3-reference, SWDIO, SWCLK, GND, and NRST connector:

```sh
.venv/bin/pio run -t upload
```

Power the board through USB-C; the programming header's 3V3 is a voltage reference. Avoid powering the board simultaneously from an unknown programmer supply. Firmware is necessary for output operation. The release MOSFET's GPIO pull-down holds the converter disabled while the MCU is blank, reset, or without 3V3; the NPN kill is biased independently from AUX_5V. A failure of AUX_5V itself remains a separate supply fault requiring bench qualification.

Native policy checks, covering every permitted V/I combination and the exact converter encodings:

```sh
mkdir -p .pio
cc -std=c11 -Wall -Wextra -Werror -Iinclude src/policy.c test/policy_test.c -o .pio/policy-test
.pio/policy-test
```

The default is **12.0 V / 5.50 A, output OFF**. While OFF, press SET briefly to select voltage or current and press or hold − / + to adjust it. Hold SET for 0.8 seconds to RUN. While running, press SET to STOP immediately after button debounce; holding it afterwards does not restart output. The range is **2.1–15 V, 0.50–6.00 A, at most 72 W nominal**. Increasing voltage reduces the current setting when needed to stay within the power budget. There is no automatic restart or settings persistence across power cycles.

The display shows selected limits and approximate measured voltage/current with a `~` marker. CV means voltage regulation; CC means the converter is limiting current. The selected voltage is regulated before the 10 mΩ current shunt; the load sees approximately 10 mV less per ampere. The 2.1 V floor provides nominal margin above the converter's 2 V current-sense common-mode minimum at 6 A. The ADC uses the MCU's factory VREFINT calibration to account for the 3V3 supply, but the shunt, amplifier, and divider remain uncalibrated. Settings and readings are nominal; analog component tolerances still apply.

RUN requires a healthy PD fault signal and an approximately 18–22 V qualified input. The standalone PD sink and hardware UVLO enforce the intended 20 V / 5 A source contract. A 100 W USB-C PD source and a 5 A e-marked cable are required. This firmware does not negotiate PD itself.

Startup holds release permission LOW, asserting hardware kill. On an explicit RUN request it resets the converter through EN, verifies qualified input, drives permission HIGH with the converter's reset OE=0, writes and reads back every V/I and protection setting, verifies input again, and writes OE=1 last. SC/OVP, driver communication failure, missing PD, ADC failure, or screen communication failure asserts hardware kill and latches OFF. Ordinary current limiting is allowed. An independent watchdog resets the MCU after approximately 500 ms without refresh; the hardware pull-down disables output during reset. Normal STOP clears OE and retains EN for the converter's output discharge. Supplemental ADC checks stop sustained readings more than 0.6 V / 0.6 A above the selected limits; these are not a replacement for the hardware regulation loop.

GPIO contract:

| MCU pin | Signal |
|---|---|
| PA0 / physical 7 | Output current ADC: nominal 0.2 V/A |
| PA1 / physical 8 | Output voltage ADC: 100k/20k divider, gain 1/6 |
| PA2 / physical 9 | LOW = hardware kill, HIGH = release converter EN |
| PA3 / physical 10 | Converter SC/OVP indication, active LOW |
| PA4 / physical 11 | − button, active LOW |
| PA5 / physical 12 | SET/RUN button, active LOW |
| PA6 / physical 13 | + button, active LOW |
| PA7 / physical 14 | PD fault, active HIGH |
| PA11 / physical 16 | I2C2 SCL, AF6, no remap |
| PA12 / physical 17 | I2C2 SDA, AF6, no remap |
| PB7 / physical 1 | Qualified input voltage ADC11: 150k/22k divider |
| PA13 / physical 18; PA14 / physical 19 | SWDIO / SWCLK |

PB8 shares physical pin1 with PB7 and is kept analog. TPS55289 address is 0x75; Waveshare 0.91-inch SSD1306 OLED (SKU14657) is 0x3C. The I2C timing is designed for 16 MHz PCLK and approximately 100 kHz; validate rise times and transaction timing on routed hardware.

The converter uses feedback ratio 0.0752 (register04=0x02), the exact 0.5645 mV reference DAC step, 10 mΩ current shunt / 50 mA limit steps, shortest 128 µs current-loop delay, hiccup, and output discharge. Register05=0xA0 enables SC/OVP indications and disables OCP indication; STATUS register07 is still polled for normal CC operation. TI's indication-mask bits use **1 = indication enabled**.

Primary references: [ST datasheet](https://www.st.com/resource/en/datasheet/stm32g030f6.pdf), [ST HAL/CMSIS source](https://github.com/STMicroelectronics/STM32CubeG0), [TI TPS55289 datasheet](https://www.ti.com/lit/ds/symlink/tps55289.pdf), [Waveshare display](https://www.waveshare.com/0.91inch-oled-module.htm). No temperature regulation, hot-side fan control, or polarity reversal is implemented. Fit an appropriate heatsink before energizing the Peltier.
