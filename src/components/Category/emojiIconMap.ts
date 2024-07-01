import React from "react"
import {
  IconFolderOpen,
  IconBook2,
  IconSeeding,
  IconCloud,
  IconServerBolt,
  IconDeviceDesktop,
  IconFileZip,
  IconCpu,
  IconChartHistogram,
  IconSpeakerphone
} from "@tabler/icons-react"

export const emojiIconMap: { [key: string]: React.ElementType } = {
  "📂": IconFolderOpen,
  "📕": IconBook2,
  "😎": IconSeeding,
  "☁": IconCloud,
  "💾": IconServerBolt,
  "🖥": IconDeviceDesktop,
  "📑": IconFileZip,
  "💡": IconCpu,
  "📊": IconChartHistogram,
  "📢": IconSpeakerphone
}