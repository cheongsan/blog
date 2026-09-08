import Image, { ImageProps } from "next/image"
import { useState } from "react"
import { ImageLoadingIndicator } from "@/components/ui/image-loading-indicator"

function ImageWithLoader({ src, alt, onLoad, onError, ...props }: ImageProps) {
  const [settledSrc, setSettledSrc] = useState<ImageProps["src"] | null>(null)
  const isLoading = settledSrc !== src

  return (
    <>
      {isLoading && <ImageLoadingIndicator />}
      <Image
        {...props}
        src={src}
        alt={alt}
        onLoad={(event) => {
          setSettledSrc(src)
          onLoad?.(event)
        }}
        onError={(event) => {
          setSettledSrc(src)
          onError?.(event)
        }}
      />
    </>
  )
}

export { ImageWithLoader }
