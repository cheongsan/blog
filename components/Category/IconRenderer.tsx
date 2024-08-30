import React from "react"
import { EmojiIconMap } from "@/components/category/EmojiIconMap"

interface IconRendererProps {
  category: string
  size?: number
}

const IconRenderer: React.FC<IconRendererProps> = ({ category = "", size = 20 }) => {
  const [emoji, ...textParts] = category.split(" ")
  const text = textParts.join(" ")
  const IconComponent = EmojiIconMap[emoji] || null
  return (
    <>
      {IconComponent ? React.createElement(IconComponent, { size }) : emoji} {text}
    </>
  )
}

export default IconRenderer