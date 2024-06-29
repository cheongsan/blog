import React from "react"
import {
  IconFolderOpen,
  IconBook2,
  IconCloud,
  IconServerBolt,
  IconDeviceDesktop,
  IconFileZip,
  IconCpu,
  IconBulbFilled,
} from "@tabler/icons-react"

export const emojiIconMap: { [key: string]: React.ElementType } = {
  "📂": IconFolderOpen,
  "📕": IconBook2,
  "☁": IconCloud,
  "💾": IconServerBolt,
  "🖥": IconDeviceDesktop,
  "📑": IconFileZip,
  "💡": IconCpu,
  "🤖": IconBulbFilled,
}