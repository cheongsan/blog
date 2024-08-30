import { CONFIG } from "@/site.config"
import styled from "@emotion/styled"

const Logo = () => {
  return (
    <StyledWrapper href="/" aria-label={CONFIG.blog.title}>
      {CONFIG.blog.title}
    </StyledWrapper>
  )
}

export default Logo

const StyledWrapper = styled.a`
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
`