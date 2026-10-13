# Revision B input-loss interlock

## Why an additional latch is necessary

The TPS259470A's 174 kΩ / 10 kΩ OVLO divider trips at approximately 22.08 V
and recovers at approximately 20.06 V. The separate LMV393 upper window is
nominally 22.66 V. An excursion between those rising thresholds can therefore
turn the eFuse off without asserting either the external upper comparator or
the eFuse's FLT output. If CH224K PG stays asserted, the original permissions
remain armed and the eFuse can automatically restore power.

TI specifies that OVLO is not internally latched and leaves FLT high.
AUXOFF, however, falls when the established input becomes invalid.
The added interlock records that falling edge. It preserves the existing
voltage thresholds and does not depend on firmware polling or PG changing.

## Circuit and sequence

`U_AUX_BUFFER` first buffers `INPUT_AUXOFF`, so the eFuse's existing 10 kΩ
pullup only drives logic inputs. `Q_AUX_INVERT` inverts the buffered signal;
the second Schmitt channel cleans up its 4.7 kΩ pulled-up collector edge.
This drives the positive-edge clock of `U_AUX_LOSS_LATCH`.

The latch's D and active-low preset are tied high. Its active-low clear is
`RUN_CLK`, the existing Schmitt-buffered `MCU_RUN`. Q drives `Q_AUX_FAULT`,
an open-collector sink on the shared `INPUT_FAULT_N` net. The original
supervisor, thermal, PD and programming interlocks continue to use this net.
Each new IC has a local 100 nF bypass capacitor. The seven added components
reuse already imported, supplier-mapped parts.

| Event | AUXOFF | RUN | New latch / result |
|---|---|---|---|
| Boot, before arming | Low | Low | Asynchronously cleared |
| Intentional input start / inrush | Initially low | High | Clock was already high; releasing clear creates no clock edge |
| Input established | Rises high | High | Clock falls; no fault captured |
| Input becomes invalid, including OVLO | Falls low | High | Clock rises; fault latches and clears both original permissions |
| Input voltage recovers | May recover | Still high | Fault remains asserted; TEC and fan cannot automatically restart |
| Intentional disarm | Any | Low | New latch clears; eFuse enable is also low |
| Requalification and fresh RUN / ARM sequence | Normal | Deliberately cycled | Original permission latches can be armed again |

Do not clear the new latch from `INPUT_FAULT_N` or `INPUT_CLEAR_N`: either
would feed its own output back into its reset and defeat sticky retention.
Firmware must drive RUN low, wait for fault propagation/clear, requalify
input and sensors, initialize the DAC, and issue the normal fresh permission
edges. Merely restoring voltage, toggling TEC_REQUEST, or issuing an ARM
edge while RUN stays high cannot clear the new fault.

## Scope and validation

This closes the reported recovery gap **after AUXOFF has first become high**.
An invalid input during initial inrush, before AUXOFF has ever asserted,
does not produce a falling edge. Firmware must still qualify raw VBUS before
arming, require AUXOFF to assert within a characterized startup timeout,
and disarm on timeout. AUXOFF does not establish a USB-PD current contract
and does not report every load fault; the existing FLT path is still needed.

`tests/input-loss-interlock.test.tsx` evaluates ideal logic models against
the rendered component pin/net graph. It covers startup, sticky recovery,
repeated AUXOFF transitions, deliberate re-arm, both shutdown event orders
and coexistence with other wired-OR faults. `check:revision` additionally
checks every new interlock connection, including the eFuse's AUXOFF pin.

These checks are not an analogue or timing simulation. Before powered release,
measure AUXOFF pulse widths, the two transistor transitions, clear release
relative to the clock, brownout/startup behavior and the complete eFuse-enable
shutdown delay over supply and temperature. Very short transients, metastability
and physical fault propagation are not proved by ideal logic tests. Revision B
remains unrouted and all other release gates still apply.

## Primary references

- [TPS25947 datasheet](https://www.ti.com/lit/ds/symlink/tps25947.pdf): §§7.3.3,
  7.3.9 (Table 7-3) and 7.3.10 describe OVLO recovery, FLT and AUXOFF.
- [SN74LVC1G74 datasheet](https://www.ti.com/lit/ds/symlink/sn74lvc1g74.pdf):
  pin table, function table and timing requirements for clock and clear.
- [SN74LVC2G17 datasheet](https://www.ti.com/lit/ds/symlink/sn74lvc2g17.pdf):
  Schmitt input conditioning and output drive.
