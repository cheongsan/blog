import {
  gray,
  blue,
  red,
  green,
  grayDark,
  blueDark,
  redDark,
  greenDark,
  indigo,
  indigoDark,
} from "@radix-ui/colors"

import { 
  light,
  dark,
} from "./colour"

export type Colors = typeof colors.light & typeof colors.dark

export const colors = {
  light: {
    ...light,
    ...indigo,
    ...gray,
    ...blue,
    ...red,
    ...green,
  },
  dark: {
    ...dark,
    ...indigoDark,
    ...grayDark,
    ...blueDark,
    ...redDark,
    ...greenDark,
  },
}
