import React from "react"
import {
  TbFolderOpen,
  TbBook2,
  TbSeeding,
  TbCloud,
  TbServerBolt,
  TbDeviceDesktop,
  TbFileZip,
  TbCpu,
  TbChartHistogram,
  TbSpeakerphone
} from "react-icons/tb"
import { PiGearSixBold } from "react-icons/pi"

export const EmojiIconMap: { [key: string]: React.ElementType } = {
  "📂": TbFolderOpen,
  "📕": TbBook2,
  "😎": TbSeeding,
  "☁": TbCloud,
  "💾": TbServerBolt,
  "🖥": TbDeviceDesktop,
  "📑": TbFileZip,
  "💡": TbCpu,
  "📊": TbChartHistogram,
  "📢": TbSpeakerphone,
  "⚙": PiGearSixBold
}