import Copyright from "./Copyright"
import ThemeToggle from "./ThemeToggle"
import styled from "@emotion/styled"
import { zIndexes } from "src/styles/zIndexes"

type Props = {
  fullWidth: boolean
}

const Footer: React.FC<Props> = ({ fullWidth }) => {
  return (
    <StyledWrapper>
      <div data-full-width={fullWidth} className="container">
        <div className="nav">
          <Copyright />
        </div>
        <div className="d-flex">
          <ThemeToggle />
        </div>
      </div>
    </StyledWrapper>
  )
}

export default Footer

const StyledWrapper = styled.footer`
  z-index: ${zIndexes.header};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.nav};
  backdrop-filter: saturate(180%) blur(20px);

  .container {
    display: flex;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1120px;
    height: 5rem;
    margin: 0 auto;
    font-size: 1.5rem;
    &[data-full-width="true"] {
      @media (min-width: 768px) {
        padding-left: 6rem;
        padding-right: 6rem;
      }
    }
    .nav {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
  }
`
