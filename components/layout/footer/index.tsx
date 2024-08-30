import Copyright from "./Copyright"
import ThemeToggle from "./ThemeToggle"
import styled from "@emotion/styled"
import { zIndexes } from "@/styles/zIndexes"
import React from "react"

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
      <div data-full-width={fullWidth} className="container">
        <p>
          This blog works by importing posts written in&nbsp;
          <a href="https://notion.com" target="_blank" className="notion-link">Notion</a>.
          &nbsp;It is adapted from the&nbsp;
          <a href="https://github.com/morethanmin/morethan-log" target="_blank" className="notion-link">
            morethan-log project</a>
          &nbsp;and hosted by <a href="https://vercel.com" target="_blank" className="notion-link">
            Vercel</a>.
        </p>
      </div>
    </StyledWrapper>
)
}

export default Footer

const StyledWrapper = styled.footer`
z-index: ${zIndexes.header};
    position: sticky;
    top: 0;
    background-color: var(--nav);
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
      >p {
          margin-top: 0.75rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: var(--gray-10);
          >a{
              text-decoration: inherit;
              border-bottom: .05em solid;
              border-color: var(--fg-color-2);
              opacity: 1;
          }
      }
  }
`
