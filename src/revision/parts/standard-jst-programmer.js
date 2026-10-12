import { jsx, jsxs, Fragment } from "react/jsx-runtime";
var pinLabels$d = { pin1: ["pin1"], pin2: ["pin2"], pin3: ["pin3"] };
var JstSwdSide = ({ uartSilkscreenLabels, ...props }) => {
  return jsx("connector", { standard: "jst_sh", pinCount: 3, pinLabels: pinLabels$d, supplierPartNumbers: {
    jlcpcb: [
      "C160403"
    ]
  }, manufacturerPartNumber: "SM03B-SRSS-TB(LF)(SN)", footprint: jsxs("footprint", { children: [jsx("smtpad", { portHints: ["pin1"], pcbX: "-1.000125mm", pcbY: "2.0500086mm", width: "0.5999988mm", height: "1.5500096mm", shape: "rect" }), jsx("smtpad", { portHints: ["pin2"], pcbX: "0.000127mm", pcbY: "2.0500086mm", width: "0.5999988mm", height: "1.5500096mm", shape: "rect" }), jsx("smtpad", { portHints: ["pin3"], pcbX: "1.000125mm", pcbY: "2.0500086mm", width: "0.5999988mm", height: "1.5500096mm", shape: "rect" }), jsx("smtpad", { portHints: [], pcbX: "2.300097mm", pcbY: "-1.8250154mm", width: "1.499997mm", height: "1.999996mm", shape: "rect" }), jsx("smtpad", { portHints: [], pcbX: "-2.300097mm", pcbY: "-1.8250154mm", width: "1.499997mm", height: "1.999996mm", shape: "rect" }), jsx("silkscreenpath", { route: [{ x: -2.5000203999999258, y: 1.725015600000006 }, { x: -1.5311373999998068, y: 1.725015600000006 }] }), jsx("silkscreenpath", { route: [{ x: 1.5311374000000342, y: 1.725015600000006 }, { x: 2.499918800000046, y: 1.725015600000006 }] }), jsx("silkscreenpath", { route: [{ x: 2.499918800000046, y: 1.725015600000006 }, { x: 2.499918800000046, y: -0.5938519999999698 }] }), jsx("silkscreenpath", { route: [{ x: -2.3697691999999506, y: 1.725015600000006 }, { x: -2.5000203999999258, y: 1.725015600000006 }] }), jsx("silkscreenpath", { route: [{ x: -2.5000203999999258, y: 1.725015600000006 }, { x: -2.5000203999999258, y: -0.5938519999999698 }] }), jsx("silkscreenpath", { route: [{ x: -1.318844199999944, y: -2.524963200000002 }, { x: 1.3188696000000846, y: -2.524963200000002 }] }), jsx("silkscreencircle", { pcbX: "-1.999869mm", pcbY: "2.1124926mm", radius: "0.31623mm" }), jsx("silkscreentext", { text: "{NAME}", pcbX: "0.004191mm", pcbY: uartSilkscreenLabels ? 5.2 : 3.8374086, anchorAlignment: "center", fontSize: "1mm" }), uartSilkscreenLabels && jsx("silkscreentext", { text: uartSilkscreenLabels[0], pcbX: -1, pcbY: 4, fontSize: 0.5 }), uartSilkscreenLabels && jsx("silkscreentext", { text: uartSilkscreenLabels[1], pcbX: 0, pcbY: 4, fontSize: 0.5 }), uartSilkscreenLabels && jsx("silkscreentext", { text: uartSilkscreenLabels[2], pcbX: 1, pcbY: 4, fontSize: 0.5 }), jsx("courtyardoutline", { outline: [{ x: -3.2938089999998965, y: 3.0874086000000034 }, { x: 3.302191000000107, y: 3.0874086000000034 }, { x: 3.302191000000107, y: -3.051391399999943 }, { x: -3.2938089999998965, y: -3.051391399999943 }, { x: -3.2938089999998965, y: 3.0874086000000034 }] })] }), cadModel: {
    objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C160403.obj?uuid=65828f37d6e7448b8cbc0db14b6c48c4",
    stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C160403.step?uuid=65828f37d6e7448b8cbc0db14b6c48c4",
    pcbRotationOffset: 0,
    modelOriginPosition: { x: 1.0000761999999668, y: 0.3445008999999346, z: -0.01 }
  }, ...props });
};
var pinLabels$b = { pin1: ["pin1"], pin2: ["pin2"] };
var JstPowerSide = (props) => {
  return jsx("connector", { standard: "jst_sh", pinCount: 2, pinLabels: pinLabels$b, supplierPartNumbers: {
    jlcpcb: [
      "C160402"
    ]
  }, manufacturerPartNumber: "SM02B-SRSS-TB(LF)(SN)", footprint: jsxs("footprint", { children: [jsx("smtpad", { portHints: [], pcbX: "-1.799971mm", pcbY: "-1.8750153mm", width: "1.1999976mm", height: "1.7999964mm", shape: "rect" }), jsx("smtpad", { portHints: [], pcbX: "1.799971mm", pcbY: "-1.8750153mm", width: "1.1999976mm", height: "1.7999964mm", shape: "rect" }), jsx("smtpad", { portHints: ["pin2"], pcbX: "0.499999mm", pcbY: "2.0000087mm", width: "0.5999988mm", height: "1.5500096mm", shape: "rect" }), jsx("smtpad", { portHints: ["pin1"], pcbX: "-0.499999mm", pcbY: "2.0000087mm", width: "0.5999988mm", height: "1.5500096mm", shape: "rect" }), jsx("silkscreenpath", { route: [{ x: -0.9688575999997511, y: -2.587510699999939 }, { x: 0.9688576000002058, y: -2.587510699999939 }] }), jsx("silkscreenpath", { route: [{ x: -1.9999959999997827, y: -0.13750289999995857 }, { x: -1.9999959999997827, y: -0.7438517000000502 }] }), jsx("silkscreenpath", { route: [{ x: 1.0311384000000317, y: 1.7125061000001551 }, { x: 1.9999960000001238, y: 1.7125061000001551 }, { x: 1.9999960000001238, y: -0.7438517000000502 }] }), jsx("silkscreenpath", { route: [{ x: -1.9999959999997827, y: -0.13750289999995857 }, { x: -1.9999959999997827, y: 1.7125061000001551 }, { x: -1.031138399999918, y: 1.7125061000001551 }] }), jsx("silkscreentext", { text: "{NAME}", pcbX: "-0.009271mm", pcbY: "3.7731847mm", anchorAlignment: "center", fontSize: "1mm" }), jsx("courtyardoutline", { outline: [{ x: -2.6595709999999144, y: 3.0231847000000016 }, { x: 2.641029000000117, y: 3.0231847000000016 }, { x: 2.641029000000117, y: -3.0394152999998596 }, { x: -2.6595709999999144, y: -3.0394152999998596 }, { x: -2.6595709999999144, y: 3.0231847000000016 }] })] }), cadModel: {
    objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C160402.obj?uuid=b15083895b61401296a20b79cbc50a55",
    stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C160402.step?uuid=b15083895b61401296a20b79cbc50a55",
    pcbRotationOffset: 0,
    modelOriginPosition: { x: 0.4999999999997726, y: 0.5135125000000245, z: -0.01 }
  }, ...props });
};
var swdPinLabels = { pin1: ["SWCLK"], pin2: ["GND"], pin3: ["SWDIO"] };
var powerPinLabels = { pin1: ["VOUT"], pin2: ["GND"] };
function StandardJstSwdSide(props) {
  return jsx(JstSwdSide, { ...props, pinLabels: swdPinLabels });
}
function StandardJstPowerSide(props) {
  return jsx(JstPowerSide, { ...props, pinLabels: powerPinLabels });
}
var uartPinLabels = { pin1: ["RX"], pin2: ["GND"], pin3: ["TX"] };
var uartHostPinLabels = { pin1: ["TX"], pin2: ["GND"], pin3: ["RX"] };
function StandardJstUartSide({ role = "target", ...props }) {
  return jsx(JstSwdSide, { ...props, pinLabels: role === "host" ? uartHostPinLabels : uartPinLabels, uartSilkscreenLabels: role === "host" ? ["TX", "GND", "RX"] : ["RX", "GND", "TX"] });
}
export {
  StandardJstUartSide,
  StandardJstSwdSide,
  StandardJstPowerSide
};
