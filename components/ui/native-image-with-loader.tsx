import { CSSProperties, ImgHTMLAttributes, useState } from "react"
import { ImageLoadingIndicator } from "@/components/ui/image-loading-indicator"

type NativeImageWithLoaderProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "height" | "width"
> & {
  height?: number | string | null
  width?: number | string | null
  priority?: boolean
  objectFit?: CSSProperties["objectFit"]
  objectPosition?: CSSProperties["objectPosition"]
}

function NativeImageWithLoader({
  src,
  alt = "",
  className,
  style,
  height,
  width,
  priority = false,
  objectFit,
  objectPosition,
  loading,
  onLoad,
  onError,
  ...props
}: NativeImageWithLoaderProps) {
  const [settledSrc, setSettledSrc] = useState<string | undefined>()
  const isLoading = Boolean(src) && settledSrc !== src
  const isNotionIcon = className?.includes("notion-page-icon") ?? false
  const showIndicator = isLoading && !isNotionIcon
  const needsLoadingHeight = showIndicator && !height && !width

  return (
    <>
      {showIndicator && <ImageLoadingIndicator />}
      {/* Notion content can contain arbitrary remote hosts and unknown dimensions. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        src={src}
        alt={alt}
        className={className}
        width={width ?? undefined}
        height={height ?? undefined}
        loading={priority ? "eager" : loading ?? "lazy"}
        decoding="async"
        style={{
          ...style,
          objectFit: objectFit ?? style?.objectFit,
          objectPosition: objectPosition ?? style?.objectPosition,
          minHeight: needsLoadingHeight
            ? style?.minHeight ?? "6rem"
            : style?.minHeight,
        }}
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

export { NativeImageWithLoader }
