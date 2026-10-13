import { plan as usb } from "./usb"
import { plan as tecPower } from "./tec-power"
import { plan as groundSupply } from "./ground-supply"
import { plan as mcu } from "./mcu"
import { plan as pdInput } from "./pd-input"
import { plan as tecAnalog } from "./tec-analog"
import { plan as interlock } from "./interlock"
import { plan as thermal } from "./thermal"
import { plan as fan } from "./fan"
import { plan as i2cDebug } from "./i2c-debug"

export const routingPlans = [usb, tecPower, groundSupply, mcu, pdInput,
  tecAnalog, interlock, thermal, fan, i2cDebug]
