#ifndef GENERAL_PD_POLICY_H
#define GENERAL_PD_POLICY_H

#include <stdbool.h>
#include <stdint.h>

#define PD_MIN_MV 2100u
#define PD_MAX_MV 15000u
#define PD_MIN_MA 500u
#define PD_MAX_MA 6000u
#define PD_MAX_MW 72000u
#define PD_DEFAULT_MV 12000u
#define PD_DEFAULT_MA 5500u
#define TPS_ADDRESS 0x75u
#define TPS_MODE_OFF 0x30u /* Hiccup and output discharge enabled. */
#define TPS_MODE_ON 0xB0u
#define TPS_INTERNAL_FB 0x02u /* Internal feedback ratio 0.0752. */
#define TPS_CDC_FAULTS 0xA0u /* SC/OVP indication; no cable compensation. */
#define TPS_FATAL_STATUS 0xA0u /* SC bit7 / OVP bit5; OCP bit6 is normal CC. */

typedef struct {
  uint16_t voltage_mv;
  uint16_t current_ma;
  bool edit_current;
} pd_settings;

void pd_defaults(pd_settings *settings);
bool pd_valid(const pd_settings *settings);
void pd_adjust(pd_settings *settings, int direction);
uint16_t pd_reference_code(uint16_t voltage_mv);
uint8_t pd_current_code(uint16_t current_ma);

#endif
