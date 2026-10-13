#include <assert.h>
#include <stdio.h>
#include "policy.h"

int main(void) {
  pd_settings s;
  pd_defaults(&s);
  assert(pd_valid(&s) && s.voltage_mv == 12000 && s.current_ma == 5500);
  assert(pd_reference_code(12000) == 1518);
  assert(pd_reference_code(15000) == 1918); /* Exact TI 0.5645 mV LSB. */
  assert(pd_current_code(5500) == 0xEE);
  assert(pd_current_code(500) == 0x8A);
  assert((TPS_MODE_OFF & 0x80) == 0 && (TPS_MODE_ON & 0x80) != 0);
  assert((TPS_FATAL_STATUS & 0x40) == 0); /* Constant current is not fatal. */

  for (unsigned mv = PD_MIN_MV; mv <= PD_MAX_MV; mv += 100) {
    for (unsigned ma = PD_MIN_MA; ma <= PD_MAX_MA; ma += 50) {
      s = (pd_settings){(uint16_t)mv, (uint16_t)ma, false};
      if (!pd_valid(&s)) continue;
      unsigned code = pd_reference_code(s.voltage_mv);
      assert(code <= 2047);
      /* Encoded reference <= chosen reference, within one DAC step. */
      assert(code * 5645 + 450000 <= mv * 752);
      assert((code + 1) * 5645 + 450000 > mv * 752);
      pd_adjust(&s, 1); assert(pd_valid(&s));
      pd_adjust(&s, -1); assert(pd_valid(&s));
      s.edit_current = true;
      pd_adjust(&s, 1); assert(pd_valid(&s));
      pd_adjust(&s, -1); assert(pd_valid(&s));
    }
  }
  s = (pd_settings){15000, 4800, true};
  pd_adjust(&s, 1); assert(s.current_ma == 4800);
  s = (pd_settings){11900, 6000, false};
  pd_adjust(&s, 1); assert(s.voltage_mv == 12000 && s.current_ma == 6000);
  pd_adjust(&s, 1); assert(s.current_ma == 5950);
  s = (pd_settings){12000, 6050, false}; assert(!pd_valid(&s));
  s = (pd_settings){15000, 6000, false}; assert(!pd_valid(&s));
  s = (pd_settings){2000, 450, false}; assert(!pd_valid(&s));
  s = (pd_settings){2000, 500, false}; assert(!pd_valid(&s));
  puts("Policy tests passed: all valid V/I combinations stay within bounds.");
  return 0;
}
