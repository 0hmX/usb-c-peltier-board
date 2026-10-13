#ifndef GENERAL_PD_DISPLAY_H
#define GENERAL_PD_DISPLAY_H
#include <stdbool.h>
#include "stm32g0xx_hal.h"

bool display_init(I2C_HandleTypeDef *bus);
bool display_lines(I2C_HandleTypeDef *bus, const char *lines[4]);
#endif
