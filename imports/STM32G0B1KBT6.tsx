import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["PB9"],
  pin2: ["PC14_OSC32_IN"],
  pin3: ["PC15_OSC32_OUT"],
  pin4: ["VDD","VDDA"],
  pin5: ["VSS","VSSA"],
  pin6: ["PF2_NRST"],
  pin7: ["PA0"],
  pin8: ["PA1"],
  pin9: ["PA2"],
  pin10: ["PA3"],
  pin11: ["PA4"],
  pin12: ["PA5"],
  pin13: ["PA6"],
  pin14: ["PA7"],
  pin15: ["PB0"],
  pin16: ["PB1"],
  pin17: ["PB2"],
  pin18: ["PA8"],
  pin19: ["PA9"],
  pin20: ["PC6"],
  pin21: ["PA10"],
  pin22: ["PA11_PA9_"],
  pin23: ["PA12_PA10_"],
  pin24: ["PA13"],
  pin25: ["PA14_BOOT0"],
  pin26: ["PA15"],
  pin27: ["PB3"],
  pin28: ["PB4"],
  pin29: ["PB5"],
  pin30: ["PB6"],
  pin31: ["PB7"],
  pin32: ["PB8"]
} as const

// Roles used on this board; USB and I2C use separate physical pins.
const pinAttributes = {
  pin4: {requiresPower: true, requiresVoltage: "3.3V", shouldHaveDecouplingCapacitor: true},
  pin5: {requiresGround: true}, pin6: {isInput: true},
  pin7: {isInput: true}, pin8: {isInput: true}, pin10: {isInput: true}, pin11: {isInput: true},
  pin12: {isInput: true}, pin14: {isInput: true},
  pin15: {isOutput: true, canUseTriState: true}, pin16: {isOutput: true}, pin17: {isOutput: true},
  pin22: {isBidirectional: true}, pin23: {isBidirectional: true},
  pin24: {isBidirectional: true}, pin25: {isInput: true},
  pin30: {isBidirectional: true, canUseOpenDrain: true, isUsingOpenDrain: true, needsExternalPullup: true, activeCapability: "i2c_scl"},
  pin31: {isBidirectional: true, canUseOpenDrain: true, isUsingOpenDrain: true, needsExternalPullup: true, activeCapability: "i2c_sda"},
} as const

export const STM32G0B1KBT6 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C5270165"
  ]
}}
      manufacturerPartNumber="STM32G0B1KBT6"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-2.800096mm" pcbY="-4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-1.999996mm" pcbY="-4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="-1.199896mm" pcbY="-4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="-0.40005mm" pcbY="-4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="0.40005mm" pcbY="-4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="1.199896mm" pcbY="-4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="1.999996mm" pcbY="-4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="2.800096mm" pcbY="-4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin9"]} pcbX="4.242054mm" pcbY="-2.800096mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin10"]} pcbX="4.242054mm" pcbY="-1.999996mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin11"]} pcbX="4.242054mm" pcbY="-1.199896mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin12"]} pcbX="4.242054mm" pcbY="-0.40005mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin13"]} pcbX="4.242054mm" pcbY="0.40005mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin14"]} pcbX="4.242054mm" pcbY="1.199896mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin15"]} pcbX="4.242054mm" pcbY="1.999996mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin16"]} pcbX="4.242054mm" pcbY="2.800096mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin17"]} pcbX="2.800096mm" pcbY="4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin18"]} pcbX="1.999996mm" pcbY="4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin19"]} pcbX="1.199896mm" pcbY="4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin20"]} pcbX="0.40005mm" pcbY="4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin21"]} pcbX="-0.40005mm" pcbY="4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin22"]} pcbX="-1.199896mm" pcbY="4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin23"]} pcbX="-1.999996mm" pcbY="4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin24"]} pcbX="-2.800096mm" pcbY="4.242054mm" width="0.4480052mm" height="1.6839946mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin25"]} pcbX="-4.242054mm" pcbY="2.800096mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin26"]} pcbX="-4.242054mm" pcbY="1.999996mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin27"]} pcbX="-4.242054mm" pcbY="1.199896mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin28"]} pcbX="-4.242054mm" pcbY="0.40005mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin29"]} pcbX="-4.242054mm" pcbY="-0.40005mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin30"]} pcbX="-4.242054mm" pcbY="-1.199896mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin31"]} pcbX="-4.242054mm" pcbY="-1.999996mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<smtpad portHints={["pin32"]} pcbX="-4.242054mm" pcbY="-2.800096mm" width="1.6839946mm" height="0.4480052mm" radius="0.2240026mm" shape="pill" />
<silkscreenpath route={[{"x":-3.5761929999999893,"y":3.2144969999999375},{"x":-3.5761929999999893,"y":3.5761929999998756},{"x":-3.2144969999999375,"y":3.5761929999998756}]} />
<silkscreenpath route={[{"x":3.5761929999998756,"y":3.2144969999999375},{"x":3.5761929999998756,"y":3.5761929999998756},{"x":3.2144969999999375,"y":3.5761929999998756}]} />
<silkscreenpath route={[{"x":-3.5761929999999893,"y":-3.2144969999999375},{"x":-3.5761929999999893,"y":-3.5761929999999893},{"x":-3.2144969999999375,"y":-3.5761929999999893}]} />
<silkscreenpath route={[{"x":3.5761929999998756,"y":-3.2144969999999375},{"x":3.5761929999998756,"y":-3.5761929999999893},{"x":3.2144969999999375,"y":-3.5761929999999893}]} />
<silkscreenpath route={[{"x":-3.1713932000000113,"y":-3.1713932000000113},{"x":-3.1713932000000113,"y":3.1713932000000113},{"x":3.1713931999998977,"y":3.1713932000000113},{"x":3.1713931999998977,"y":-3.1713932000000113},{"x":-3.1713932000000113,"y":-3.1713932000000113}]} />
<silkscreencircle pcbX="-2.800096mm" pcbY="-5.384038mm" radius="0.100076mm" />
<silkscreencircle pcbX="-2.671318mm" pcbY="-2.671318mm" radius="0.150114mm" />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="5.8514mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-5.334051300000056,"y":5.334051300000056},{"x":5.334051300000056,"y":5.334051300000056},{"x":5.334051300000056,"y":-5.334051300000056},{"x":-5.334051300000056,"y":-5.334051300000056},{"x":-5.334051300000056,"y":5.334051300000056}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C5270165.obj?uuid=28eea09222224639a3999749955a1ff3",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C5270165.step?uuid=28eea09222224639a3999749955a1ff3",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: 0.000795 },
      }}
      {...props}
    />
  )
}