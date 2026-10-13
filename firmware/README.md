# USB control and firmware

The board has **PD IN** for Peltier power and **PROGRAM** for USB data, configuration, and firmware updates. PROGRAM can power the logic by itself; it cannot energize the Peltier without qualified PD power. There is no display or button UI.

The application targets **STM32G0B1KBT6, 128 KB flash / 144 KB RAM**. It uses ST's official STM32CubeG0 HAL/CMSIS and pinned TinyUSB 0.18.0 for native USB CDC. HSI48 plus CRS synchronized to USB SOF supplies the USB clock without a crystal. USB attaches only when PROGRAM VBUS is detected. The PCB remains unrouted: USB enumeration, flash programming, and converter operation have not been bench-tested.

## Configure once, then use PD alone

```sh
python3 -m venv .venv
.venv/bin/pip install -r host/requirements.txt
.venv/bin/python host/control.py configure 12.0 5.5
```

This sends STOP → SET → SAVE, storing the nominal **12 V / 5.5 A** TEC1-12706 profile. On a subsequent PD connection the saved profile starts after approximately one second of stable qualified input. Add `--run` to start immediately after saving when PD is already connected. Unplugging PROGRAM leaves an operating output running on PD.

```sh
.venv/bin/python host/control.py configure 12.0 5.5 --run
.venv/bin/python host/control.py status
.venv/bin/python host/control.py stop
.venv/bin/python host/control.py run
```

The host tool selects a single connected driver automatically. Use `--port /dev/cu.usbmodem…` or `--port COM…` before the command when needed. Any serial terminal also works, with newline-terminated commands; USB CDC does not depend on the selected baud rate.

| Command | Behavior |
|---|---|
| `SET 12000 5500` | Set millivolts and milliamperes atomically, only while OFF |
| `SAVE` | Save the current profile, only while OFF; acknowledge only after flash readback |
| `RUN` | Start with the current limits after PD and register checks |
| `STOP` | Stop and cancel pending automatic start for this PD session |
| `STATUS` | Report run/CC/PD/fault, limits, approximate readings, saved-profile validity, and DFU readiness as JSON |
| `CLEAR` | Stay OFF and clear a protective fault latch; RUN remains explicit for the current connection |
| `BOOT` | Disable output, then reset into ST's native USB DFU bootloader |

Limits are **2.1–15 V in 0.1 V steps**, **0.50–6.00 A in 0.05 A steps**, and **72 W maximum nominal**. Invalid commands, overflow, unsupported steps, and excessive power are rejected without changing settings. The factory default is 12 V / 5.5 A but **OFF until a valid profile has been saved or RUN is requested**.

SAVE writes a versioned, CRC32-checked 16-byte record in the final 2 KB flash page at `0x0801F800`. The linker reserves that page, and the firmware checks the 128 KB device and unswapped bank layout before erasing it. Saving an identical valid profile does not erase flash again. Interrupted or invalid records cannot enable automatic output; a failed save returns an error. No automatic flash writes occur.

A source interruption shorter than one second stops output and requires RUN. After PD has been absent for at least one second, a new qualified connection can start the saved profile. SC/OVP, ADC, converter communication, and excessive measured-limit faults latch OFF. They do not automatically retry following another PD negotiation; clear the fault or request RUN explicitly. The protective latch also survives watchdog/software reset in retained RAM. A full logic power cycle clears that RAM latch. A healthy saved profile still starts on a fresh power connection.

POWER indicates logic supply, RUN indicates enabled output, and FAULT indicates a latched fault. Normal constant-current limiting is permitted and appears as `cc=1` in STATUS. The selected voltage is regulated before the 10 mΩ shunt, so load voltage is approximately 10 mV lower per ampere. ADC readings use factory VREFINT calibration but remain approximate because the divider, shunt, and monitor are uncalibrated.

## Build

From this directory:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/pio run
```

Outputs are `.pio/build/general-pd/firmware.bin` and `firmware.elf`. SDK/toolchain dependencies download outside the tracked source. The build derives a linker script from the pinned official ST script: 126 KB for application code, 2 KB for the saved profile, and a retained `.noinit` RAM section for boot/fault requests.

Native checks:

```sh
mkdir -p .pio
cc -std=c11 -Wall -Wextra -Werror -Iinclude src/policy.c src/command.c test/policy_test.c -o .pio/policy-test
.pio/policy-test
cc -std=c11 -Wall -Wextra -Werror -Iinclude src/policy.c src/profile.c src/session.c test/profile_session_test.c -o .pio/profile-session-test
.pio/profile-session-test
python3 -m unittest discover -s host -p 'test_*.py'
```

## USB programming and recovery

Use [ST's official STM32CubeProgrammer](https://www.st.com/en/development-tools/stm32cubeprog.html). A blank MCU enters its ROM loader following a cold power-on. Connect PROGRAM, select USB DFU, and program the binary at `0x08000000`. The ROM's empty-flash reset limitation means a blank device may require complete power removal and reconnection instead of a reset pulse; disconnect both USB sources for a cold start.

During factory programming configure and verify **`nBOOT_SEL=0`, `nBOOT1=1`, `BOOT_LOCK=0`, `IWDG_SW=0`**. These enable BOOT0 recovery and the hardware watchdog mode that ST documents as refreshed in the ROM loader. Keep bank swapping disabled. The application reports `dfu_ready=1` only when the boot/watchdog settings match; BOOT refuses an incomplete factory configuration.

With one target selected, an illustrative official CLI sequence is:

```sh
STM32_Programmer_CLI -l usb
STM32_Programmer_CLI -c port=USB1 -w .pio/build/general-pd/firmware.bin 0x08000000 -v
STM32_Programmer_CLI -c port=USB1 -ob nBOOT_SEL=0 nBOOT1=1 BOOT_LOCK=0 IWDG_SW=0
```

Select the actual target shown by the tool; option programming resets the device. After successful programming, cold power-cycle if needed to leave empty-check boot mode. Later use `.venv/bin/python host/control.py boot`, then update the application over the same PROGRAM USB-C port. Avoid mass erase to preserve the saved profile; verify the profile with STATUS after an update. A factory erase intentionally removes it.

If the application cannot respond, hold the **BOOT0** test pad at 3V3 while asserting/releasing **NRST**, or cold-power it with BOOT0 held HIGH, to enter ROM DFU. Remove the BOOT0 link for normal boot. BOOT0 shares SWCLK; the board supplies a pull-down. SWDIO, SWCLK, NRST, 3V3-reference, and GND test pads provide an independent ST-LINK recovery path. These are test pads, not fitted buttons. PB0 output permission stays LOW in reset and is not used by any ROM boot interface, so programming cannot enable the converter through a bootloader UART pin.

The BOOT command holds output disabled, acknowledges over CDC, records a retained RAM request, and performs a system reset. Early startup jumps to the G0B1 system-memory vectors at `0x1FFF0000` with reset clocks and output permission LOW. It does not jump to the separate secure-memory entry address.

## Pin and control contract

| MCU signal / physical pin | Use |
|---|---|
| PB0 / 15 | HIGH grants output permission; LOW/reset/Hi-Z disables |
| PA0 / 7; PA1 / 8 | Current ADC0 (0.2 V/A); output ADC1 (100k/20k) |
| PA3 / 10 | Qualified PD input ADC3 (150k/22k) |
| PA4 / 11 | PROGRAM VBUS presence (15k/20k), no internal pull |
| PA5 / 12; PA7 / 14 | Driver SC/OVP active LOW; PD fault active HIGH |
| PB1 / 16; PB2 / 17 | RUN / FAULT LEDs, active HIGH |
| PB6 / 30; PB7 / 31 | I2C1 SCL/SDA AF6, converter address 0x75 |
| PA11 / 22; PA12 / 23 | Native USB DM/DP, no pin remap |
| PA13 / 24; PA14 / 25; NRST / 6 | SWDIO / SWCLK-BOOT0 / reset |

RUN holds the converter reset through EN, verifies approximately 18–22 V qualified input and the PD fault signal, releases EN with reset OE=0, writes and reads back every voltage/current/protection register, checks PD again, and writes OE=1 last. SC/OVP and communication failure drive hardware permission LOW. The independent watchdog resets after approximately 500 ms without refresh; the hardware pull-down disables output during reset. Native USB detach does not change PD permission.

Primary references: [ST G0B1 datasheet](https://www.st.com/resource/en/datasheet/stm32g0b1kb.pdf), [ST AN2606 bootloader §50 / watchdog §4.8](https://www.st.com/content/ccc/resource/technical/document/application_note/b9/9b/16/3a/12/1e/40/0c/CD00167594.pdf/files/CD00167594.pdf/jcr:content/translations/en.CD00167594.pdf), [ST HAL/CMSIS source](https://github.com/STMicroelectronics/STM32CubeG0), [TinyUSB 0.18.0](https://github.com/hathach/tinyusb/tree/0.18.0), [TI converter datasheet](https://www.ti.com/lit/ds/symlink/tps55289.pdf). USB uses TinyUSB's development VID/PID; assign a product identity before distributing units. The firmware implements power regulation without temperature control, fan control, or polarity reversal. Mount and cool the Peltier appropriately before RUN.
