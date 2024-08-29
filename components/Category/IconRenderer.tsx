import React from "react"
import { emojiIconMap } from "@/components/category/emojiIconMap"

interface IconRendererProps {
  category: string
  size?: number
}

const IconRenderer: React.FC<IconRendererProps> = ({ category = "", size = 20 }) => {
  const [emoji, ...textParts] = category.split(" ")
  const text = textParts.join(" ")
  const IconComponent = emojiIconMap[emoji] || null
  return (
    <>
      {IconComponent ? React.createElement(IconComponent, { size }) : emoji} {text}
    </>
  )
}

export default IconRenderer