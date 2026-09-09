import React, { useState } from "react"
import styled from "@emotion/styled"
import { NativeImageWithLoader } from "@/components/ui/native-image-with-loader"

const StyledImage = styled(NativeImageWithLoader)`
  display: block;
  margin-top: 0;
  margin-right: auto;
  border-radius: 50%;
`

const ImageFrame = styled.span<{ $size: number }>`
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 50%;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`

const Gravatar = ({ size = 200 }) => {
  const localImageUrl = `gravatar-${size * 2}.png`
  const defaultImageUrl = "avatar.svg"
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const imgSrc =
    failedImageUrl === localImageUrl ? defaultImageUrl : localImageUrl

  return (
    <ImageFrame $size={size}>
      <StyledImage
        src={imgSrc}
        alt="Gravatar"
        width={size}
        height={size}
        onError={() => setFailedImageUrl(localImageUrl)}
      />
    </ImageFrame>
  )
}

export default Gravatar
