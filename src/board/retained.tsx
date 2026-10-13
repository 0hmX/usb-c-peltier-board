import { createElement, type ComponentType } from "react"
import type { ChipProps } from "@tscircuit/props"
import { tecInductorCadModel } from "./cad-models"
import { StandardJstThermistorSide } from "./parts/StandardJstThermistorSide"
import { StandardJstFanSide } from "./parts/StandardJstFanSide"
import { TPS259470ARPWR as C3662799 } from "../parts/C3662799"
import { A_0603WAF4701T5E as C23162 } from "../parts/C23162"
import { FRC0603F1002TS as C2906982 } from "../parts/C2906982"
import { A_0603WAF1003T5E as C25803 } from "../parts/C25803"
import { A_0603WAF1743T5E as C22890 } from "../parts/C22890"
import { FRC0603F1271TS as C2930048 } from "../parts/C2930048"
import { A_0603WAF4702T5E as C25819 } from "../parts/C25819"
import { CL10A105KB8NNNC as C15849 } from "../parts/C15849"
import { CL10B332KB8NNNC as C1613 } from "../parts/C1613"
import { LT3741EFE_1_PBF as C671324 } from "../parts/C671324"
import { NTMFS5C670NLT1G as C179626 } from "../parts/C179626"
import { APS1360M6R8H as C49073699 } from "../parts/C49073699"
import { PA2512FKE7W0R008E as C5824006 } from "../parts/C5824006"
import { A_0603WAF220KT5E as C22939 } from "../parts/C22939"
import { SS14 as C2480 } from "../parts/C2480"
import { CL10B224KB8NNNC as C64705 } from "../parts/C64705"
import { CL21A226MAQNNNE as C45783 } from "../parts/C45783"
import { CC0603KRX7R9BB104 as C14663 } from "../parts/C14663"
import { CL21B105KBFNNNE as C28323 } from "../parts/C28323"
import { CL32A106KBJNNNE as C380537 } from "../parts/C380537"
import { JBLM2101M035C077RTM_100UF_35V as C19270709 } from "../parts/C19270709"
import { JBLM2221M025C090RTM_220UF_25V as C19270707 } from "../parts/C19270707"
import { CL32B226KAJNNNE as C309062 } from "../parts/C309062"
import { A_0603WAF100JT5E as C22859 } from "../parts/C22859"
import { CL10B333KB8NNNC as C21117 } from "../parts/C21117"
import { A_0603WAF2202T5E as C31850 } from "../parts/C31850"
import { A_0603B472K500NT as C53987 } from "../parts/C53987"
import { A_0603WAF8252T5E as C23251 } from "../parts/C23251"
import { A_0603B103K500NT as C57112 } from "../parts/C57112"
import { A_0603WAF1212T5E as C22864 } from "../parts/C22864"
import { A_0603WAF6192T5E as C23091 } from "../parts/C23091"
import { A_0603WAF1692T5E as C25954 } from "../parts/C25954"
import { MMBT3906 as C7420354 } from "../parts/C7420354"
import { MMBT3904_RANGE_100_300_ as C20526 } from "../parts/C20526"
import { A_0603WAF7502T5E as C23242 } from "../parts/C23242"
import { INA219AIDR as C138706 } from "../parts/C138706"
import { KF301_5_0_2P as C474881 } from "../parts/C474881"
import { AP63203WU_7 as C780769 } from "../parts/C780769"
import { FNR4030S4R7MT as C167874 } from "../parts/C167874"
import { SN74LVC1G74DCUR as C70285 } from "../parts/C70285"
import { TLV803SDBZR as C132016 } from "../parts/C132016"
import { BAT54A_215 as C130910 } from "../parts/C130910"
import { SN74LVC2G17DBVR as C10429 } from "../parts/C10429"
import { MCP4725A0T_E_CH as C144198 } from "../parts/C144198"
import { LMV393IDR as C7984 } from "../parts/C7984"
import { TPS54202DDCR as C191884 } from "../parts/C191884"
import { YSPI0630A_220M as C497873 } from "../parts/C497873"
import { B4B_PH_K_S_LF__SN_ as C131334 } from "../parts/C131334"
import { B2B_PH_K_S_LF__SN_ as C131337 } from "../parts/C131337"
import { A_0603WAF1001T5E as C21190 } from "../parts/C21190"
import { FRC0603F1332TS as C2933140 } from "../parts/C2933140"
import { A_0603WAF5231T5E as C23068 } from "../parts/C23068"
import { GRM31CC72A475KE11L as C237304 } from "../parts/C237304"
import { CL21A226MAYNNNE as C602037 } from "../parts/C602037"
import { CL10C101JB8NNNC as C14858 } from "../parts/C14858"
import { LTST_C190KGKT as C125094 } from "../parts/C125094"
import { A_0603WAF2491T5E as C22908 } from "../parts/C22908"
import { A_0603WAF1502T5E as C22809 } from "../parts/C22809"
import { LTST_C190KRKT as C94869 } from "../parts/C94869"

export type RetainedComponent = {
  name: string
  part: string
  connections: Record<string, string>
  noConnect: string[]
  original: [number, number, number]
  block: string
}

export const retainedComponents: RetainedComponent[] = [
  {"name":"U_INPUT","part":"C3662799","connections":{"pin1":"net.INPUT_ENABLE","pin2":"net.INPUT_OVLO","pin4":"net.INPUT_FAULT_N","pin5":"net.VBUS_RAW","pin6":"net.VBUS_TEC","pin7":"net.INPUT_DVDT","pin8":"net.GND","pin9":"net.INPUT_CURRENT_MON"},"noConnect":["PG","ITIMER"],"original":[-18,15,0],"block":"input"},
  {"name":"R_PD_SCL","part":"C23162","connections":{"pin1":"net.V3V3","pin2":"net.I2C_SCL"},"noConnect":[],"original":[-22,4,90],"block":"input"},
  {"name":"R_PD_SDA","part":"C23162","connections":{"pin1":"net.V3V3","pin2":"net.I2C_SDA"},"noConnect":[],"original":[-22,0.5,90],"block":"input"},
  {"name":"R_INPUT_RUN","part":"C2906982","connections":{"pin1":"net.MCU_RUN","pin2":"net.INPUT_ENABLE"},"noConnect":[],"original":[-20,12.5,0],"block":"input"},
  {"name":"R_INPUT_OFF","part":"C25803","connections":{"pin1":"net.INPUT_ENABLE","pin2":"net.GND"},"noConnect":[],"original":[-21,16,90],"block":"input"},
  {"name":"R_INPUT_OV_TOP","part":"C22890","connections":{"pin1":"net.VBUS_RAW","pin2":"net.INPUT_OVLO"},"noConnect":[],"original":[-22,20,0],"block":"input"},
  {"name":"R_INPUT_OV_BOTTOM","part":"C2906982","connections":{"pin1":"net.INPUT_OVLO","pin2":"net.GND"},"noConnect":[],"original":[-21.5,18.5,0],"block":"input"},
  {"name":"R_INPUT_ILIM","part":"C2930048","connections":{"pin1":"net.INPUT_CURRENT_MON","pin2":"net.GND"},"noConnect":[],"original":[-14.5,15.5,90],"block":"input"},
  {"name":"R_INPUT_FAULT","part":"C25819","connections":{"pin1":"net.V3V3","pin2":"net.INPUT_FAULT_N"},"noConnect":[],"original":[-23,28.5,0],"block":"input"},
  {"name":"C_USB_IN","part":"C15849","connections":{"pin1":"net.VBUS_RAW","pin2":"net.GND"},"noConnect":[],"original":[-39,19,0],"block":"input"},
  {"name":"C_INPUT_DVDT","part":"C1613","connections":{"pin1":"net.INPUT_DVDT","pin2":"net.GND"},"noConnect":[],"original":[-13.05,16.3,90],"block":"input"},
  {"name":"C_INPUT_OUT","part":"C15849","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[-16,17.7,0],"block":"input"},
  {"name":"U2","part":"C671324","connections":{"pin1":"net.TEC_VCC_INT","pin2":"net.GND","pin3":"net.VBUS_TEC","pin4":"net.TEC_EN_UVLO","pin5":"net.TEC_VREF","pin6":"net.TEC_HARD_LIMIT","pin7":"net.GND","pin8":"net.TEC_CURRENT_COMMAND","pin9":"net.TEC_SS","pin10":"net.TEC_FB","pin11":"net.TEC_SENSE_P_FILTERED","pin12":"net.TEC_SENSE_N_FILTERED","pin13":"net.TEC_VC","pin14":"net.TEC_RT","pin15":"net.GND","pin16":"net.GND","pin17":"net.TEC_HG","pin18":"net.TEC_SW","pin19":"net.TEC_BOOT","pin20":"net.TEC_LG","pin21":"net.GND"},"noConnect":[],"original":[-5,12,0],"block":"tec"},
  {"name":"Q20","part":"C179626","connections":{"pin1":"net.TEC_SW","pin2":"net.TEC_SW","pin3":"net.TEC_SW","pin4":"net.TEC_HIGH_GATE","pin5":"net.VBUS_TEC"},"noConnect":[],"original":[4,18,90],"block":"tec"},
  {"name":"Q21","part":"C179626","connections":{"pin1":"net.GND","pin2":"net.GND","pin3":"net.GND","pin4":"net.TEC_LOW_GATE","pin5":"net.TEC_SW"},"noConnect":[],"original":[4,9,270],"block":"tec"},
  {"name":"L2","part":"C49073699","connections":{"pin1":"net.TEC_SW","pin2":"net.TEC_INDUCTOR_OUT"},"noConnect":[],"original":[16.5,12,0],"block":"tec"},
  {"name":"R20","part":"C5824006","connections":{"pin1":"net.TEC_INDUCTOR_OUT","pin2":"net.TEC_POS"},"noConnect":[],"original":[28.5,12,0],"block":"tec"},
  {"name":"R21","part":"C22939","connections":{"pin1":"net.TEC_HG","pin2":"net.TEC_HIGH_GATE"},"noConnect":[],"original":[-4,17.5,90],"block":"tec"},
  {"name":"R22","part":"C22939","connections":{"pin1":"net.TEC_LG","pin2":"net.TEC_LOW_GATE"},"noConnect":[],"original":[-8,17.5,90],"block":"tec"},
  {"name":"R23","part":"C25803","connections":{"pin1":"net.TEC_HIGH_GATE","pin2":"net.TEC_SW"},"noConnect":[],"original":[10,20,0],"block":"tec"},
  {"name":"R24","part":"C25803","connections":{"pin1":"net.TEC_LOW_GATE","pin2":"net.GND"},"noConnect":[],"original":[10,3,0],"block":"tec"},
  {"name":"D20","part":"C2480","connections":{"pin1":"net.TEC_BOOT","pin2":"net.TEC_VCC_INT"},"noConnect":[],"original":[-10.5,19,90],"block":"tec"},
  {"name":"C20","part":"C64705","connections":{"pin1":"net.TEC_BOOT","pin2":"net.TEC_SW"},"noConnect":[],"original":[-6.5,18.7,90],"block":"tec"},
  {"name":"C21","part":"C45783","connections":{"pin1":"net.TEC_VCC_INT","pin2":"net.GND"},"noConnect":[],"original":[-11,8,90],"block":"tec"},
  {"name":"C41","part":"C45783","connections":{"pin1":"net.TEC_VCC_INT","pin2":"net.GND"},"noConnect":[],"original":[-11,4,90],"block":"tec"},
  {"name":"C22","part":"C14663","connections":{"pin1":"net.TEC_VCC_INT","pin2":"net.GND"},"noConnect":[],"original":[-8.5,5.25,0],"block":"tec"},
  {"name":"C24","part":"C28323","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[-7.25,6.95,0],"block":"tec"},
  {"name":"C25","part":"C380537","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[-5,25,90],"block":"tec"},
  {"name":"C26","part":"C380537","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[-1.5,25,90],"block":"tec"},
  {"name":"C27","part":"C380537","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[2,25,90],"block":"tec"},
  {"name":"C38","part":"C380537","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[5.5,25,90],"block":"tec"},
  {"name":"C39","part":"C380537","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[9,25,90],"block":"tec"},
  {"name":"C40","part":"C380537","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[12.5,25,90],"block":"tec"},
  {"name":"C28","part":"C19270709","connections":{"pin2":"net.GND","pin1":"net.VBUS_TEC"},"noConnect":[],"original":[19,23,0],"block":"tec"},
  {"name":"C29","part":"C19270707","connections":{"pin2":"net.GND","pin1":"net.TEC_POS"},"noConnect":[],"original":[29,-2,90],"block":"tec"},
  {"name":"C30","part":"C309062","connections":{"pin1":"net.TEC_POS","pin2":"net.GND"},"noConnect":[],"original":[30,7,90],"block":"tec"},
  {"name":"C31","part":"C309062","connections":{"pin1":"net.TEC_POS","pin2":"net.GND"},"noConnect":[],"original":[26,7,90],"block":"tec"},
  {"name":"R25","part":"C22859","connections":{"pin1":"net.TEC_INDUCTOR_OUT","pin2":"net.TEC_SENSE_P_FILTERED"},"noConnect":[],"original":[1.5,14.2,180],"block":"tec"},
  {"name":"R26","part":"C22859","connections":{"pin1":"net.TEC_POS","pin2":"net.TEC_SENSE_N_FILTERED"},"noConnect":[],"original":[1.5,12.8,180],"block":"tec"},
  {"name":"C32","part":"C21117","connections":{"pin1":"net.TEC_SENSE_P_FILTERED","pin2":"net.TEC_SENSE_N_FILTERED"},"noConnect":[],"original":[-0.75,13.4,270],"block":"tec"},
  {"name":"R27","part":"C31850","connections":{"pin1":"net.TEC_VC","pin2":"net.TEC_COMP_RC"},"noConnect":[],"original":[-10,23,0],"block":"tec"},
  {"name":"C33","part":"C53987","connections":{"pin1":"net.TEC_COMP_RC","pin2":"net.GND"},"noConnect":[],"original":[-13,23,0],"block":"tec"},
  {"name":"R28","part":"C23251","connections":{"pin1":"net.TEC_RT","pin2":"net.GND"},"noConnect":[],"original":[-4,20.2,0],"block":"tec"},
  {"name":"C34","part":"C14663","connections":{"pin1":"net.TEC_SS","pin2":"net.GND"},"noConnect":[],"original":[-1,6.5,0],"block":"tec"},
  {"name":"C35","part":"C57112","connections":{"pin1":"net.TEC_VREF","pin2":"net.GND"},"noConnect":[],"original":[-4,7,0],"block":"tec"},
  {"name":"R29","part":"C25803","connections":{"pin1":"net.TEC_POS","pin2":"net.TEC_FB"},"noConnect":[],"original":[0,1,0],"block":"tec"},
  {"name":"R30","part":"C22864","connections":{"pin1":"net.TEC_FB","pin2":"net.GND"},"noConnect":[],"original":[3,1,0],"block":"tec"},
  {"name":"R31","part":"C23091","connections":{"pin1":"net.TEC_VREF","pin2":"net.TEC_HARD_LIMIT"},"noConnect":[],"original":[-8,2,0],"block":"tec"},
  {"name":"R32","part":"C25803","connections":{"pin1":"net.TEC_HARD_LIMIT","pin2":"net.GND"},"noConnect":[],"original":[-5,2,0],"block":"tec"},
  {"name":"C36","part":"C14663","connections":{"pin1":"net.TEC_HARD_LIMIT","pin2":"net.GND"},"noConnect":[],"original":[-2,3.5,0],"block":"tec"},
  {"name":"R33","part":"C25954","connections":{"pin1":"net.TEC_DAC","pin2":"net.TEC_CURRENT_COMMAND"},"noConnect":[],"original":[-15,5.5,0],"block":"tec"},
  {"name":"R34","part":"C2906982","connections":{"pin1":"net.TEC_CURRENT_COMMAND","pin2":"net.GND"},"noConnect":[],"original":[-15,3,0],"block":"tec"},
  {"name":"C37","part":"C14663","connections":{"pin1":"net.TEC_CURRENT_COMMAND","pin2":"net.GND"},"noConnect":[],"original":[-12,1,0],"block":"tec"},
  {"name":"Q22","part":"C7420354","connections":{"pin2":"net.VBUS_TEC","pin3":"net.TEC_PERMISSION_SUPPLY","pin1":"net.TEC_PERMISSION_PNP_BASE"},"noConnect":[],"original":[-13,27,0],"block":"tec"},
  {"name":"Q23","part":"C20526","connections":{"pin3":"net.TEC_PERMISSION_PNP_DRIVE","pin1":"net.TEC_PERMISSION_NPN_BASE","pin2":"net.GND"},"noConnect":[],"original":[-13,31,0],"block":"tec"},
  {"name":"R35","part":"C25803","connections":{"pin1":"net.VBUS_TEC","pin2":"net.TEC_PERMISSION_PNP_BASE"},"noConnect":[],"original":[-17,27,0],"block":"tec"},
  {"name":"R36","part":"C25819","connections":{"pin1":"net.TEC_PERMISSION_PNP_BASE","pin2":"net.TEC_PERMISSION_PNP_DRIVE"},"noConnect":[],"original":[-17,30,0],"block":"tec"},
  {"name":"R37","part":"C2906982","connections":{"pin1":"net.TEC_SAFE_EN","pin2":"net.TEC_PERMISSION_NPN_BASE"},"noConnect":[],"original":[-17,33,0],"block":"tec"},
  {"name":"R38","part":"C25803","connections":{"pin1":"net.TEC_PERMISSION_NPN_BASE","pin2":"net.GND"},"noConnect":[],"original":[-13,34,0],"block":"tec"},
  {"name":"R39","part":"C23242","connections":{"pin1":"net.TEC_PERMISSION_SUPPLY","pin2":"net.TEC_EN_UVLO"},"noConnect":[],"original":[-9,28,0],"block":"tec"},
  {"name":"R40","part":"C22864","connections":{"pin1":"net.TEC_EN_UVLO","pin2":"net.GND"},"noConnect":[],"original":[-6,30,0],"block":"tec"},
  {"name":"U_TEC_MON","part":"C138706","connections":{"pin1":"net.GND","pin2":"net.GND","pin3":"net.I2C_SDA","pin4":"net.I2C_SCL","pin5":"net.V3V3","pin6":"net.GND","pin7":"net.TEC_MON_SENSE_N","pin8":"net.TEC_MON_SENSE_P"},"noConnect":[],"original":[29,22,180],"block":"tec"},
  {"name":"R41","part":"C22859","connections":{"pin1":"net.TEC_INDUCTOR_OUT","pin2":"net.TEC_MON_SENSE_P"},"noConnect":[],"original":[27,17.5,0],"block":"tec"},
  {"name":"R42","part":"C22859","connections":{"pin1":"net.TEC_POS","pin2":"net.TEC_MON_SENSE_N"},"noConnect":[],"original":[30,17.5,0],"block":"tec"},
  {"name":"C42","part":"C14663","connections":{"pin1":"net.TEC_MON_SENSE_P","pin2":"net.TEC_MON_SENSE_N"},"noConnect":[],"original":[28.5,15.5,0],"block":"tec"},
  {"name":"C43","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[25,20,90],"block":"tec"},
  {"name":"C44","part":"C14663","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[5.5,13.4,270],"block":"tec"},
  {"name":"R45","part":"C2906982","connections":{"pin1":"net.TEC_POS","pin2":"net.GND"},"noConnect":[],"original":[25,-8.5,0],"block":"tec"},
  {"name":"J_TEC","part":"C474881","connections":{"pin1":"net.TEC_POS","pin2":"net.GND"},"noConnect":[],"original":[44,0,90],"block":"tec"},
  {"name":"U_LOGIC","part":"C780769","connections":{"pin1":"net.V3V3","pin2":"net.LOGIC_VIN","pin3":"net.LOGIC_VIN","pin4":"net.GND","pin5":"net.LOGIC_SW","pin6":"net.LOGIC_BST"},"noConnect":[],"original":[-12,-11,0],"block":"control"},
  {"name":"L_LOGIC","part":"C167874","connections":{"pin1":"net.LOGIC_SW","pin2":"net.V3V3"},"noConnect":[],"original":[-12,-6,0],"block":"control"},
  {"name":"U_LATCH","part":"C70285","connections":{"pin1":"net.ARM_CLK","pin2":"net.V3V3","pin4":"net.GND","pin5":"net.TEC_SAFE_EN","pin6":"net.TEC_CLEAR_N","pin7":"net.V3V3","pin8":"net.V3V3"},"noConnect":["N_Q"],"original":[8,-19,0],"block":"control"},
  {"name":"U_SUPERVISOR","part":"C132016","connections":{"pin1":"net.GND","pin2":"net.INPUT_FAULT_N","pin3":"net.V3V3"},"noConnect":[],"original":[7,-23.5,0],"block":"control"},
  {"name":"U_INPUT_LATCH","part":"C70285","connections":{"pin1":"net.RUN_CLK","pin2":"net.V3V3","pin4":"net.GND","pin5":"net.INPUT_ARMED","pin6":"net.INPUT_CLEAR_N","pin7":"net.V3V3","pin8":"net.V3V3"},"noConnect":["N_Q"],"original":[-14,-21,0],"block":"control"},
  {"name":"D_INPUT_PERMISSION","part":"C130910","connections":{"pin1":"net.INPUT_ARMED","pin3":"net.INPUT_ENABLE"},"noConnect":["K2"],"original":[-10,-17.5,0],"block":"control"},
  {"name":"Q_PD_LATCH","part":"C20526","connections":{"pin3":"net.INPUT_FAULT_N","pin1":"net.PD_LATCH_INHIBIT","pin2":"net.GND"},"noConnect":[],"original":[8,-14,0],"block":"control"},
  {"name":"Q_FAULT_SOURCE","part":"C7420354","connections":{"pin2":"net.V3V3","pin3":"net.FAULT_SOURCE","pin1":"net.FAULT_PNP_BASE"},"noConnect":[],"original":[13,-20,0],"block":"control"},
  {"name":"Q_FAULT_CLEAR","part":"C20526","connections":{"pin3":"net.TEC_CLEAR_RAW","pin1":"net.FAULT_NPN_BASE","pin2":"net.GND"},"noConnect":[],"original":[16,-16,0],"block":"control"},
  {"name":"Q_INPUT_CLEAR","part":"C20526","connections":{"pin3":"net.INPUT_CLEAR_RAW","pin1":"net.INPUT_FAULT_NPN_BASE","pin2":"net.GND"},"noConnect":[],"original":[-19,-6.5,0],"block":"control"},
  {"name":"U_CLEAR_BUFFER","part":"C10429","connections":{"pin1":"net.TEC_CLEAR_RAW","pin2":"net.GND","pin3":"net.INPUT_CLEAR_RAW","pin4":"net.INPUT_CLEAR_N","pin5":"net.V3V3","pin6":"net.TEC_CLEAR_N"},"noConnect":[],"original":[-22,-15,0],"block":"control"},
  {"name":"U_CLOCK_BUFFER","part":"C10429","connections":{"pin1":"net.MCU_ARM","pin2":"net.GND","pin3":"net.MCU_RUN","pin4":"net.RUN_CLK","pin5":"net.V3V3","pin6":"net.ARM_CLK"},"noConnect":[],"original":[-22,-22.1,0],"block":"control"},
  {"name":"U_DAC","part":"C144198","connections":{"pin1":"net.TEC_DAC","pin2":"net.GND","pin3":"net.V3V3","pin4":"net.I2C_SDA","pin5":"net.I2C_SCL","pin6":"net.GND"},"noConnect":[],"original":[0,-20,0],"block":"control"},
  {"name":"U_THERMAL","part":"C7984","connections":{"pin1":"net.INPUT_FAULT_N","pin2":"net.HOT_LOW","pin3":"net.HOT_HALF","pin4":"net.GND","pin5":"net.HOT_HIGH","pin6":"net.HOT_HALF","pin7":"net.INPUT_FAULT_N","pin8":"net.V3V3"},"noConnect":[],"original":[21,-20,0],"block":"control"},
  {"name":"U_FAN","part":"C191884","connections":{"pin1":"net.GND","pin2":"net.FAN_SW","pin3":"net.VBUS_TEC","pin4":"net.FAN_FB","pin5":"net.V3V3","pin6":"net.FAN_BST"},"noConnect":[],"original":[35.5,-10,0],"block":"control"},
  {"name":"L_FAN","part":"C497873","connections":{"pin1":"net.FAN_SW","pin2":"net.V12_FAN"},"noConnect":[],"original":[42.5,-10,0],"block":"control"},
  {"name":"Q_FAN_PWM","part":"C20526","connections":{"pin3":"net.FAN_PWM","pin1":"net.FAN_PWM_BASE","pin2":"net.GND"},"noConnect":[],"original":[17,-26,0],"block":"control"},
  {"name":"J_FAN","part":"C131334","connections":{"pin1":"net.GND","pin2":"net.V12_FAN","pin3":"net.FAN_TACH","pin4":"net.FAN_PWM"},"noConnect":[],"original":[32,-31,0],"block":"control"},
  {"name":"J_HOT","part":"C131337","connections":{"pin1":"net.HOT_RAW","pin2":"net.GND"},"noConnect":[],"original":[13,-31,0],"block":"control"},
  {"name":"J_COLD","part":"C131337","connections":{"pin1":"net.COLD_RAW","pin2":"net.GND"},"noConnect":[],"original":[21,-31,0],"block":"control"},
  {"name":"R201","part":"C25803","connections":{"pin1":"net.TEC_REQUEST","pin2":"net.GND"},"noConnect":[],"original":[-6.5,-18,0],"block":"control"},
  {"name":"R202","part":"C23162","connections":{"pin1":"net.TEC_REQUEST","pin2":"net.TEC_CLEAR_RAW"},"noConnect":[],"original":[4,-18,0],"block":"control"},
  {"name":"R203","part":"C25803","connections":{"pin1":"net.TEC_CLEAR_RAW","pin2":"net.GND"},"noConnect":[],"original":[4,-20.5,0],"block":"control"},
  {"name":"R204","part":"C25803","connections":{"pin1":"net.MCU_ARM","pin2":"net.GND"},"noConnect":[],"original":[11.5,-16,0],"block":"control"},
  {"name":"R205","part":"C25803","connections":{"pin1":"net.TEC_SAFE_EN","pin2":"net.GND"},"noConnect":[],"original":[12,-14,0],"block":"control"},
  {"name":"R206","part":"C2906982","connections":{"pin1":"net.PD_VALID_N","pin2":"net.PD_LATCH_INHIBIT"},"noConnect":[],"original":[8.5,-11,0],"block":"control"},
  {"name":"R207","part":"C25803","connections":{"pin1":"net.PD_LATCH_INHIBIT","pin2":"net.GND"},"noConnect":[],"original":[11.5,-11,0],"block":"control"},
  {"name":"R208","part":"C2906982","connections":{"pin1":"net.V3V3","pin2":"net.HOT_RAW"},"noConnect":[],"original":[13.5,-27,0],"block":"control"},
  {"name":"R209","part":"C2906982","connections":{"pin1":"net.V3V3","pin2":"net.COLD_RAW"},"noConnect":[],"original":[24,-27,0],"block":"control"},
  {"name":"R210","part":"C21190","connections":{"pin1":"net.HOT_RAW","pin2":"net.HOT_ADC"},"noConnect":[],"original":[3,-5.5,0],"block":"control"},
  {"name":"R211","part":"C21190","connections":{"pin1":"net.COLD_RAW","pin2":"net.COLD_ADC"},"noConnect":[],"original":[9,-5.5,0],"block":"control"},
  {"name":"R212","part":"C25803","connections":{"pin1":"net.HOT_RAW","pin2":"net.HOT_HALF"},"noConnect":[],"original":[20.5,-25,0],"block":"control"},
  {"name":"R213","part":"C25803","connections":{"pin1":"net.HOT_HALF","pin2":"net.GND"},"noConnect":[],"original":[23.5,-25,0],"block":"control"},
  {"name":"R214","part":"C25803","connections":{"pin1":"net.V3V3","pin2":"net.HOT_LOW"},"noConnect":[],"original":[27,-23,0],"block":"control"},
  {"name":"R215","part":"C2906982","connections":{"pin1":"net.HOT_LOW","pin2":"net.GND"},"noConnect":[],"original":[30,-24.5,0],"block":"control"},
  {"name":"R216","part":"C2933140","connections":{"pin1":"net.V3V3","pin2":"net.HOT_HIGH"},"noConnect":[],"original":[27,-20.5,0],"block":"control"},
  {"name":"R217","part":"C2906982","connections":{"pin1":"net.HOT_HIGH","pin2":"net.GND"},"noConnect":[],"original":[28,-18.5,0],"block":"control"},
  {"name":"R218","part":"C23162","connections":{"pin1":"net.FAN_PWM_DRIVE","pin2":"net.FAN_PWM_BASE"},"noConnect":[],"original":[13.5,-25,0],"block":"control"},
  {"name":"R219","part":"C25803","connections":{"pin1":"net.FAN_PWM_BASE","pin2":"net.GND"},"noConnect":[],"original":[10.5,-27,0],"block":"control"},
  {"name":"R220","part":"C2906982","connections":{"pin1":"net.V3V3","pin2":"net.FAN_TACH"},"noConnect":[],"original":[29,-27,0],"block":"control"},
  {"name":"R221","part":"C21190","connections":{"pin1":"net.FAN_TACH","pin2":"net.FAN_TACH_MCU"},"noConnect":[],"original":[27,-25,0],"block":"control"},
  {"name":"R222","part":"C25803","connections":{"pin1":"net.VBUS_RAW","pin2":"net.VBUS_ADC"},"noConnect":[],"original":[12,-5.5,0],"block":"control"},
  {"name":"R223","part":"C2906982","connections":{"pin1":"net.VBUS_ADC","pin2":"net.GND"},"noConnect":[],"original":[12.5,-7.5,0],"block":"control"},
  {"name":"R224","part":"C25803","connections":{"pin1":"net.TEC_POS","pin2":"net.VOUT_ADC"},"noConnect":[],"original":[15,-5.5,0],"block":"control"},
  {"name":"R225","part":"C2906982","connections":{"pin1":"net.VOUT_ADC","pin2":"net.GND"},"noConnect":[],"original":[18,-5.5,0],"block":"control"},
  {"name":"R226","part":"C25803","connections":{"pin1":"net.MCU_RUN","pin2":"net.GND"},"noConnect":[],"original":[-7,-21,0],"block":"control"},
  {"name":"R227","part":"C25803","connections":{"pin1":"net.POWER_BUDGET_HIGH","pin2":"net.GND"},"noConnect":[],"original":[-7,-23.5,0],"block":"control"},
  {"name":"R228","part":"C25803","connections":{"pin1":"net.V12_FAN","pin2":"net.FAN_FB"},"noConnect":[],"original":[35.5,-15.5,0],"block":"control"},
  {"name":"R229","part":"C23068","connections":{"pin1":"net.FAN_FB","pin2":"net.GND"},"noConnect":[],"original":[35.5,-18,0],"block":"control"},
  {"name":"R232","part":"C2906982","connections":{"pin1":"net.INPUT_FAULT_N","pin2":"net.FAULT_PNP_BASE"},"noConnect":[],"original":[14,-23,0],"block":"control"},
  {"name":"R233","part":"C25803","connections":{"pin1":"net.V3V3","pin2":"net.FAULT_PNP_BASE"},"noConnect":[],"original":[16.5,-21,0],"block":"control"},
  {"name":"R234","part":"C2906982","connections":{"pin1":"net.FAULT_SOURCE","pin2":"net.FAULT_NPN_BASE"},"noConnect":[],"original":[16.5,-19,0],"block":"control"},
  {"name":"R235","part":"C25803","connections":{"pin1":"net.FAULT_NPN_BASE","pin2":"net.GND"},"noConnect":[],"original":[19.5,-15,0],"block":"control"},
  {"name":"R236","part":"C25803","connections":{"pin1":"net.INPUT_ARMED","pin2":"net.GND"},"noConnect":[],"original":[-12,-24.5,0],"block":"control"},
  {"name":"R237","part":"C2906982","connections":{"pin1":"net.V3V3","pin2":"net.INPUT_CLEAR_RAW"},"noConnect":[],"original":[-25.5,-9,0],"block":"control"},
  {"name":"R238","part":"C2906982","connections":{"pin1":"net.FAULT_SOURCE","pin2":"net.INPUT_FAULT_NPN_BASE"},"noConnect":[],"original":[-18,-15.5,0],"block":"control"},
  {"name":"R239","part":"C25803","connections":{"pin1":"net.INPUT_FAULT_NPN_BASE","pin2":"net.GND"},"noConnect":[],"original":[-19,-18,0],"block":"control"},
  {"name":"R240","part":"C25803","connections":{"pin1":"net.TEC_CLEAR_N","pin2":"net.GND"},"noConnect":[],"original":[-25.5,-18.5,0],"block":"control"},
  {"name":"R241","part":"C25803","connections":{"pin1":"net.INPUT_CLEAR_N","pin2":"net.GND"},"noConnect":[],"original":[-25.5,-11.5,0],"block":"control"},
  {"name":"R242","part":"C25803","connections":{"pin1":"net.ARM_CLK","pin2":"net.GND"},"noConnect":[],"original":[-22,-25,0],"block":"control"},
  {"name":"R243","part":"C25803","connections":{"pin1":"net.RUN_CLK","pin2":"net.GND"},"noConnect":[],"original":[-25.5,-25,0],"block":"control"},
  {"name":"C200","part":"C237304","connections":{"pin1":"net.LOGIC_VIN","pin2":"net.GND"},"noConnect":[],"original":[-8,-12,90],"block":"control"},
  {"name":"C201","part":"C14663","connections":{"pin1":"net.LOGIC_BST","pin2":"net.LOGIC_SW"},"noConnect":[],"original":[-15.5,-9.5,0],"block":"control"},
  {"name":"C202","part":"C602037","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[-8,-6,90],"block":"control"},
  {"name":"C206","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[-3.5,-21.5,0],"block":"control"},
  {"name":"C207","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[10.5,-23,0],"block":"control"},
  {"name":"C208","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[24.5,-15,0],"block":"control"},
  {"name":"C209","part":"C14663","connections":{"pin1":"net.HOT_ADC","pin2":"net.GND"},"noConnect":[],"original":[5.5,-3.5,0],"block":"control"},
  {"name":"C210","part":"C14663","connections":{"pin1":"net.COLD_ADC","pin2":"net.GND"},"noConnect":[],"original":[8.5,-3.5,0],"block":"control"},
  {"name":"C211","part":"C14663","connections":{"pin1":"net.VBUS_ADC","pin2":"net.GND"},"noConnect":[],"original":[11.5,-3.5,0],"block":"control"},
  {"name":"C212","part":"C14663","connections":{"pin1":"net.VOUT_ADC","pin2":"net.GND"},"noConnect":[],"original":[14.5,-3.5,0],"block":"control"},
  {"name":"C213","part":"C380537","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[31.5,-10,90],"block":"control"},
  {"name":"C214","part":"C14663","connections":{"pin1":"net.FAN_BST","pin2":"net.FAN_SW"},"noConnect":[],"original":[35.5,-13.5,0],"block":"control"},
  {"name":"C215","part":"C309062","connections":{"pin1":"net.V12_FAN","pin2":"net.GND"},"noConnect":[],"original":[42,-17,90],"block":"control"},
  {"name":"C216","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[7,-26.5,0],"block":"control"},
  {"name":"C217","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[-16.5,-24.5,0],"block":"control"},
  {"name":"C218","part":"C309062","connections":{"pin1":"net.V12_FAN","pin2":"net.GND"},"noConnect":[],"original":[46,-17,90],"block":"control"},
  {"name":"C219","part":"C380537","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[31.5,-15.5,90],"block":"control"},
  {"name":"C220","part":"C380537","connections":{"pin1":"net.VBUS_TEC","pin2":"net.GND"},"noConnect":[],"original":[31.5,-21,90],"block":"control"},
  {"name":"C221","part":"C14858","connections":{"pin1":"net.V12_FAN","pin2":"net.FAN_FB"},"noConnect":[],"original":[35.5,-20.5,0],"block":"control"},
  {"name":"C222","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[-22,-11.4,90],"block":"control"},
  {"name":"C223","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[-22,-18.5,90],"block":"control"},
  {"name":"R501","part":"C31850","connections":{"pin1":"net.VBUS_RAW","pin2":"net.D501_A"},"noConnect":[],"original":[-42.5,19,180],"block":"debug"},
  {"name":"D501","part":"C125094","connections":{"pin1":"net.GND","pin2":"net.D501_A"},"noConnect":[],"original":[-45,-6,0],"block":"debug"},
  {"name":"R502","part":"C31850","connections":{"pin1":"net.VBUS_TEC","pin2":"net.D502_A"},"noConnect":[],"original":[-8.35,25.5,180],"block":"debug"},
  {"name":"D502","part":"C125094","connections":{"pin1":"net.GND","pin2":"net.D502_A"},"noConnect":[],"original":[-39,-6,0],"block":"debug"},
  {"name":"R503","part":"C22908","connections":{"pin1":"net.V3V3","pin2":"net.D503_A"},"noConnect":[],"original":[-5.8,-8.7,0],"block":"debug"},
  {"name":"D503","part":"C125094","connections":{"pin1":"net.GND","pin2":"net.D503_A"},"noConnect":[],"original":[-33,-6,0],"block":"debug"},
  {"name":"R504","part":"C22809","connections":{"pin1":"net.V12_FAN","pin2":"net.D504_A"},"noConnect":[],"original":[43.2,-21.2,270],"block":"debug"},
  {"name":"D504","part":"C125094","connections":{"pin1":"net.GND","pin2":"net.D504_A"},"noConnect":[],"original":[-45,-12,0],"block":"debug"},
  {"name":"R505","part":"C22809","connections":{"pin1":"net.TEC_POS","pin2":"net.D505_A"},"noConnect":[],"original":[28.4,-8.4,270],"block":"debug"},
  {"name":"D505","part":"C125094","connections":{"pin1":"net.GND","pin2":"net.D505_A"},"noConnect":[],"original":[-39,-12,0],"block":"debug"},
  {"name":"R506","part":"C22908","connections":{"pin1":"net.V3V3","pin2":"net.D506_A"},"noConnect":[],"original":[-45,-20.5,90],"block":"debug"},
  {"name":"D506","part":"C125094","connections":{"pin1":"net.DBG_PD_GATE","pin2":"net.D506_A"},"noConnect":[],"original":[-45,-18,0],"block":"debug"},
  {"name":"R507","part":"C22908","connections":{"pin1":"net.DBG_TEC_PERMIT","pin2":"net.D507_A"},"noConnect":[],"original":[-39,-20.5,90],"block":"debug"},
  {"name":"D507","part":"C125094","connections":{"pin1":"net.GND","pin2":"net.D507_A"},"noConnect":[],"original":[-39,-18,0],"block":"debug"},
  {"name":"R508","part":"C22908","connections":{"pin1":"net.V3V3","pin2":"net.D508_A"},"noConnect":[],"original":[-31,-20.5,90],"block":"debug"},
  {"name":"D508","part":"C94869","connections":{"pin1":"net.DBG_HW_INHIBIT","pin2":"net.D508_A"},"noConnect":[],"original":[-31,-18,0],"block":"debug"},
  {"name":"U_DBG1","part":"C10429","connections":{"pin1":"net.PD_VALID_N","pin2":"net.GND","pin3":"net.TEC_SAFE_EN","pin4":"net.DBG_TEC_PERMIT","pin5":"net.V3V3","pin6":"net.DBG_PD_GATE"},"noConnect":[],"original":[-42,-24,0],"block":"debug"},
  {"name":"U_DBG2","part":"C10429","connections":{"pin1":"net.INPUT_CLEAR_N","pin2":"net.GND","pin3":"net.MCU_RUN","pin4":"net.DBG_MCU_RUN","pin5":"net.V3V3","pin6":"net.DBG_HW_INHIBIT"},"noConnect":[],"original":[-34,-24,0],"block":"debug"},
  {"name":"C_DBG1","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[-42,-20.5,90],"block":"debug"},
  {"name":"C_DBG2","part":"C14663","connections":{"pin1":"net.V3V3","pin2":"net.GND"},"noConnect":[],"original":[-34,-20.5,90],"block":"debug"},
  {"name":"TP01","part":"testpoint","connections":{"pin1":"net.VBUS_RAW"},"noConnect":[],"original":[-39.72,22,0],"block":"debug"},
  {"name":"TP02","part":"testpoint","connections":{"pin1":"net.VBUS_TEC"},"noConnect":[],"original":[-8,32,0],"block":"debug"},
  {"name":"TP03","part":"testpoint","connections":{"pin1":"net.V3V3"},"noConnect":[],"original":[-28,-13,0],"block":"debug"},
  {"name":"TP04","part":"testpoint","connections":{"pin1":"net.V12_FAN"},"noConnect":[],"original":[40,-21.5,0],"block":"debug"},
  {"name":"TP05","part":"testpoint","connections":{"pin1":"net.TEC_POS"},"noConnect":[],"original":[34,-4.669921,0],"block":"debug"},
  {"name":"TP06","part":"testpoint","connections":{"pin1":"net.HOT_ADC"},"noConnect":[],"original":[4.8,-0.7,0],"block":"debug"},
  {"name":"TP07","part":"testpoint","connections":{"pin1":"net.COLD_ADC"},"noConnect":[],"original":[7.8,-0.7,0],"block":"debug"},
  {"name":"TP08","part":"testpoint","connections":{"pin1":"net.VBUS_ADC"},"noConnect":[],"original":[10.8,-0.7,0],"block":"debug"},
  {"name":"TP09","part":"testpoint","connections":{"pin1":"net.VOUT_ADC"},"noConnect":[],"original":[13.8,-0.7,0],"block":"debug"},
  {"name":"TP10","part":"testpoint","connections":{"pin1":"net.I2C_SCL"},"noConnect":[],"original":[-1.5,-16.5,0],"block":"debug"},
  {"name":"TP11","part":"testpoint","connections":{"pin1":"net.I2C_SDA"},"noConnect":[],"original":[2.45,-16.5,0],"block":"debug"},
  {"name":"TP12","part":"testpoint","connections":{"pin1":"net.TEC_DAC"},"noConnect":[],"original":[-3,-24,0],"block":"debug"},
  {"name":"TP13","part":"testpoint","connections":{"pin1":"net.MCU_NRST"},"noConnect":[],"original":[21,-5,0],"block":"debug"},
  {"name":"TP14","part":"testpoint","connections":{"pin1":"net.DBG_PD_GATE"},"noConnect":[],"original":[-46,-23.5,0],"block":"debug"},
  {"name":"TP15","part":"testpoint","connections":{"pin1":"net.DBG_TEC_PERMIT"},"noConnect":[],"original":[-38,-23.5,0],"block":"debug"},
  {"name":"TP16","part":"testpoint","connections":{"pin1":"net.DBG_HW_INHIBIT"},"noConnect":[],"original":[-35,-28,0],"block":"debug"},
  {"name":"TP17","part":"testpoint","connections":{"pin1":"net.DBG_MCU_RUN"},"noConnect":[],"original":[-31,-28,0],"block":"debug"},
  {"name":"TP18","part":"testpoint","connections":{"pin1":"net.FAN_TACH_MCU"},"noConnect":[],"original":[32,-27,0],"block":"debug"},
  {"name":"TPG1","part":"testpoint","connections":{"pin1":"net.GND"},"noConnect":[],"original":[-34,29.5,0],"block":"debug"},
  {"name":"TPG2","part":"testpoint","connections":{"pin1":"net.GND"},"noConnect":[],"original":[-10,30,0],"block":"debug"},
  {"name":"TPG3","part":"testpoint","connections":{"pin1":"net.GND"},"noConnect":[],"original":[-29.5,-10.5,0],"block":"debug"},
  {"name":"TPG4","part":"testpoint","connections":{"pin1":"net.GND"},"noConnect":[],"original":[38,-23,0],"block":"debug"},
  {"name":"TPG5","part":"testpoint","connections":{"pin1":"net.GND"},"noConnect":[],"original":[38,0,0],"block":"debug"},
  {"name":"TPG6","part":"testpoint","connections":{"pin1":"net.GND"},"noConnect":[],"original":[11.5,1.1,0],"block":"debug"},
  {"name":"TPG7","part":"testpoint","connections":{"pin1":"net.GND"},"noConnect":[],"original":[-5,-26.5,0],"block":"debug"},
  {"name":"TPG8","part":"testpoint","connections":{"pin1":"net.GND"},"noConnect":[],"original":[-40,-28,0],"block":"debug"},
]

const partComponents: Record<string, ComponentType<any>> = {
  C3662799,
  C23162,
  C2906982,
  C25803,
  C22890,
  C2930048,
  C25819,
  C15849,
  C1613,
  C671324,
  C179626,
  C49073699,
  C5824006,
  C22939,
  C2480,
  C64705,
  C45783,
  C14663,
  C28323,
  C380537,
  C19270709,
  C19270707,
  C309062,
  C22859,
  C21117,
  C31850,
  C53987,
  C23251,
  C57112,
  C22864,
  C23091,
  C25954,
  C7420354,
  C20526,
  C23242,
  C138706,
  C474881,
  C780769,
  C167874,
  C70285,
  C132016,
  C130910,
  C10429,
  C144198,
  C7984,
  C191884,
  C497873,
  C131334,
  C131337,
  C21190,
  C2933140,
  C23068,
  C237304,
  C602037,
  C14858,
  C125094,
  C22908,
  C22809,
  C94869,
}

export function RetainedPart({ item, ...props }: { item: RetainedComponent } & Omit<ChipProps, "name">) {
  if (item.part === "testpoint") return <testpoint name={item.name} cadModel={null} footprint={<footprint><smtpad shape="circle" radius={1} portHints={["pin1"]} /><courtyardcircle radius={1.3} /></footprint>} {...props} connections={{ pin1: item.connections.pin1! }} />
  if (["J_HOT", "J_COLD"].includes(item.name)) return <StandardJstThermistorSide name={item.name} connections={item.connections} {...props} />
  if (item.name === "J_FAN") return <StandardJstFanSide name={item.name} connections={item.connections} {...props} />
  return createElement(partComponents[item.part]!, { name: item.name, connections: item.connections, noConnect: item.noConnect,
    ...(item.name === "L2" ? { cadModel: tecInductorCadModel } : {}), ...props })
}
