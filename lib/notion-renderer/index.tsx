import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/router';
import { ExtendedRecordMap } from "notion-types"
import useScheme from "@/lib/useScheme"
import { notocoloremoji } from "@/constants"

// core styles shared by all of react-notion-x (required)
import "react-notion-x/src/styles.css"

// used for code syntax highlighting (optional)
import "prismjs/themes/prism-tomorrow.css"

// used for rendering equations (optional)

import "katex/dist/katex.min.css"
import { FC, useState, useEffect } from "react"
import styled from "@emotion/styled"

const _NotionRenderer = dynamic(
  () => import("react-notion-x").then((m) => m.NotionRenderer),
  { ssr: false }
)

const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then(async (m) =>  m.Code )
)

const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection
  )
)
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
)
const Pdf = dynamic(
  () => import("react-notion-x/build/third-party/pdf").then((m) => m.Pdf),
  {
    ssr: false,
  }
)
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  {
    ssr: false,
  }
)

type Props = {
  recordMap: ExtendedRecordMap
}

const NotionRenderer: FC<Props> = ({ recordMap }) => {
  const [scheme] = useScheme()
  const router = useRouter();
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!recordMap || !recordMap.block || Object.keys(recordMap.block).length === 0) {
    return null
  }

  const MapPageUrl = (id: string) => {
    if (!id) return '';
    const currentPath = router.asPath.split("#")[0];
    const NotionPageID = Object.keys(recordMap.block)[0];
    return NotionPageID === id ? currentPath : "https://www.notion.so/" + id.replace(/-/g, '');
  }

  if (!mounted) return null

  return (
    <StyledWrapper suppressHydrationWarning>
      <_NotionRenderer
        recordMap={recordMap}
        components={{
          Code,
          Collection,
          Equation,
          Modal,
          Pdf,
          nextImage: Image,
          nextLink: Link,
        }}
        mapPageUrl={MapPageUrl}
      />
    </StyledWrapper>
  )
}

export default NotionRenderer

const StyledWrapper = styled.div`
  /* // TODO: why render? */
  .notion-collection-page-properties {
    display: none !important;
  }
  .notion-page {
    padding: 0;
  }
  .notion-page-icon {
    ${notocoloremoji.style}
  }
`
