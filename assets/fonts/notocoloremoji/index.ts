import { Noto_Color_Emoji } from "next/font/google"

export const notocoloremoji = Noto_Color_Emoji({
  weight: ["400"],
  subsets: ["emoji"],
  fallback: ["Apple Color Emoji"],
})
