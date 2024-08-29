import React, { ReactNode } from "react"
import { notocoloremoji } from "@/constants"

type Props = {
  className?: string
  children?: ReactNode
}

export const Emoji = ({ className, children }: Props) => {
  return (
    <span className={className} css={[notocoloremoji.style]}>
      {children}
    </span>
  )
}
