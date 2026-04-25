import { CONFIG } from "@/site.config"
import styled from "@emotion/styled"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const Logo = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const start = () => setLoading(true)
    const end = () => setLoading(false)
    router.events.on("routeChangeStart", start)
    router.events.on("routeChangeComplete", end)
    router.events.on("routeChangeError", end)
    return () => {
      router.events.off("routeChangeStart", start)
      router.events.off("routeChangeComplete", end)
      router.events.off("routeChangeError", end)
    }
  }, [router])

  return (
    <StyledWrapper href="/" aria-label={CONFIG.blog.title} data-loading={loading}>
      {CONFIG.blog.title}
    </StyledWrapper>
  )
}

export default Logo

const StyledWrapper = styled(Link)`
  font-weight: 900;
  color: var(--nav-logo);
  margin-left: -0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  transition-property: scale;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  &:hover {
    scale: 0.9;
    background-color: var(--card-link-click);
  }

  &[data-loading="true"] {
    background: linear-gradient(
      90deg,
      var(--nav-logo) 0%,
      #7ec8e3 50%,
      var(--nav-logo) 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`
