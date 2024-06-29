import React from "react"
import { emojiIconMap } from "./emojiIconMap"

const IconRenderer: React.FC<{ category: string }> = ({ category }) => {
  const [emoji, ...textParts] = category.split(" ")
  const text = textParts.join(" ")
  const IconComponent = emojiIconMap[emoji] || null
  return (
    <>
      {IconComponent ? React.createElement(IconComponent, { size: "20" }) : emoji} {text}
    </>
  )
}

export default IconRenderer