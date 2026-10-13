/** Executable firmware specification; this is not flashed MCU firmware. */
export interface TecOperatingConditions {
  negotiatedVoltage: number
  negotiatedCurrent: number
  measuredInputVoltage: number
  contractFresh: boolean
  pdAttached: boolean
  hotProbeHealthy: boolean
  coldProbeHealthy: boolean
  fanHealthy: boolean
  currentMonitorHealthy: boolean
  hardwareFaultLatched: boolean
}

export interface TecPowerBudget {
  permitted: boolean
  highInputLimit: boolean
  inputCurrentBudget: number
  electricalPowerLimit: number
  currentLimitWithoutOutputMeasurement: number
  reason: string
}

// TI §6.5 nominal 2–6 A row envelope gives a tabulated Kmin of 2964.6 AΩ.
// Those rows inherit VIN=12 V; 15/20 V behavior still needs characterization.
// Apply +1% resistance tolerance and +0.6% TCR at 85 C to this budget screen.
// High mode also requires a characterized switch resistance/capacitance.
const tabulatedMinimumInputLimitFactor = 2964.6
const maximumResistanceFactor = 1.01 * 1.006
const minimumLowInputLimit = tabulatedMinimumInputLimitFactor / (1270 * maximumResistanceFactor)
const parallelLimitResistance = (1270 * 2490) / (1270 + 2490)
const minimumHighInputLimit = tabulatedMinimumInputLimitFactor / (parallelLimitResistance * maximumResistanceFactor)
const inputCurrentHeadroom = 0.1
const conversionEfficiencyBudget = 0.9
const auxiliaryPowerReserve = 4
const voltageCeiling = 11.21
const hardwareVoltageEnvelope = 12
const firmwareCurrentCeiling = 5

function disabledBudget(reason: string): TecPowerBudget {
  return {
    permitted: false,
    highInputLimit: false,
    inputCurrentBudget: 0,
    electricalPowerLimit: 0,
    currentLimitWithoutOutputMeasurement: 0,
    reason,
  }
}

export function getTecPowerBudget(conditions: TecOperatingConditions): TecPowerBudget {
  if (!conditions.contractFresh || !conditions.pdAttached) {
    return disabledBudget("A fresh attached PD contract is required")
  }
  if (![15, 20].includes(conditions.negotiatedVoltage) ||
      !Number.isFinite(conditions.negotiatedCurrent) || conditions.negotiatedCurrent < 3 ||
      conditions.negotiatedCurrent > 5) {
    return disabledBudget("V0 supports 15 V or 20 V contracts with at least 3 A")
  }
  const minimumOperatingVoltage = Math.max(13.5, conditions.negotiatedVoltage * 0.95 - 0.75)
  if (!Number.isFinite(conditions.measuredInputVoltage) || conditions.measuredInputVoltage < minimumOperatingVoltage ||
      conditions.measuredInputVoltage > 21 ||
      conditions.measuredInputVoltage > conditions.negotiatedVoltage * 1.05) {
    return disabledBudget("Measured VBUS is outside the operating window")
  }
  if (!conditions.hotProbeHealthy || !conditions.coldProbeHealthy || !conditions.fanHealthy ||
      !conditions.currentMonitorHealthy ||
      conditions.hardwareFaultLatched) {
    return disabledBudget("Probe, fan, current monitor or latched hardware fault")
  }
  const highInputLimit = conditions.negotiatedVoltage === 20 && conditions.negotiatedCurrent >= 5
  const inputCurrentBudget = (highInputLimit ? minimumHighInputLimit : minimumLowInputLimit) - inputCurrentHeadroom
  const electricalPowerLimit = Math.max(0, Math.min(
    voltageCeiling * firmwareCurrentCeiling,
    conversionEfficiencyBudget * (conditions.measuredInputVoltage * inputCurrentBudget - auxiliaryPowerReserve),
  ))
  return {
    permitted: electricalPowerLimit > 0,
    highInputLimit,
    inputCurrentBudget,
    electricalPowerLimit,
    // Until VOUT is validated, budget against the full hardware voltage envelope.
    currentLimitWithoutOutputMeasurement: Math.min(firmwareCurrentCeiling, electricalPowerLimit / hardwareVoltageEnvelope),
    reason: "Fresh contract and hardware interlocks allow a limited soft start",
  }
}
