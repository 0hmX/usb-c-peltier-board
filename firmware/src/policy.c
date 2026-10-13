#include "policy.h"

static uint16_t current_ceiling(uint16_t voltage_mv) {
  uint32_t ma = PD_MAX_MW * 1000u / voltage_mv;
  if (ma > PD_MAX_MA) ma = PD_MAX_MA;
  return (uint16_t)(ma / 50u * 50u);
}

void pd_defaults(pd_settings *s) {
  *s = (pd_settings){PD_DEFAULT_MV, PD_DEFAULT_MA, false};
}

bool pd_valid(const pd_settings *s) {
  return s->voltage_mv >= PD_MIN_MV && s->voltage_mv <= PD_MAX_MV &&
         s->current_ma >= PD_MIN_MA && s->current_ma <= PD_MAX_MA &&
         s->voltage_mv % 100u == 0u && s->current_ma % 50u == 0u &&
         (uint32_t)s->voltage_mv * s->current_ma <= PD_MAX_MW * 1000u;
}

void pd_adjust(pd_settings *s, int direction) {
  if (s->edit_current) {
    int ma = (int)s->current_ma + (direction > 0 ? 50 : -50);
    if (ma < (int)PD_MIN_MA) ma = PD_MIN_MA;
    uint16_t ceiling = current_ceiling(s->voltage_mv);
    if (ma > (int)ceiling) ma = ceiling;
    s->current_ma = (uint16_t)ma;
  } else {
    int mv = (int)s->voltage_mv + (direction > 0 ? 100 : -100);
    if (mv < (int)PD_MIN_MV) mv = PD_MIN_MV;
    if (mv > (int)PD_MAX_MV) mv = PD_MAX_MV;
    s->voltage_mv = (uint16_t)mv;
    uint16_t ceiling = current_ceiling(s->voltage_mv);
    if (s->current_ma > ceiling) s->current_ma = ceiling;
  }
}

uint16_t pd_reference_code(uint16_t voltage_mv) {
  /* TI: Vref = 45 mV + code * 0.5645 mV; Vout = Vref / 0.0752.
   * Round down so quantization never requests more than the selected voltage. */
  return (uint16_t)(((uint32_t)voltage_mv * 752u - 450000u) / 5645u);
}

uint8_t pd_current_code(uint16_t current_ma) {
  /* A 10 mOhm shunt gives 0.05 A per 0.5 mV LSB. Bit7 enables limiting. */
  return (uint8_t)(0x80u | current_ma / 50u);
}
