import NavBar from "./NavBar"
import Logo from "./Logo"
import styled from "@emotion/styled"
import { zIndexes } from "@/styles/zIndexes"

type Props = {
  fullWidth: boolean
}

const Header: React.FC<Props> = ({ fullWidth }) => {
  return (
    <StyledWrapper>
      <div data-full-width={fullWidth} className="container">
        <Logo />
        <div className="nav">
          <NavBar />
        </div>
      </div>
    </StyledWrapper>
  )
}

export default Header

const StyledWrapper = styled.header`
    z-index: ${zIndexes.header};
    position: sticky;
    top: 0;
    background-color: var(--nav);
    backdrop-filter: saturate(180%) blur(20px);

    .container {
        display: flex;
        padding: 1.33rem 1.5rem;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 1120px;
        line-height: 1rem;
        margin: 0 auto;
        font-size: 1.3rem;

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
