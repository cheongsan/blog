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

export const emojiIconMap: { [key: string]: React.ElementType } = {
  "📂": TbFolderOpen,
  "📕": TbBook2,
  "😎": TbSeeding,
  "☁": TbCloud,
  "💾": TbServerBolt,
  "🖥": TbDeviceDesktop,
  "📑": TbFileZip,
  "💡": TbCpu,
  "📊": TbChartHistogram,
  "📢": TbSpeakerphone
}