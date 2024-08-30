import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React from "react"
import { CardLinkALT } from "@/components/CardLinkALT"
import { TbChevronLeft, TbArrowUp } from "react-icons/tb"

type Props = {}

const Footer: React.FC<Props> = () => {
  const router = useRouter()
  return (
    <StyledWrapper>
      <CardLinkALT onClick={() => router.push("/")}>
        <TbChevronLeft />&nbsp;Back
        </CardLinkALT>
      <CardLinkALT onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <TbArrowUp />&nbsp;Back to Up
      </CardLinkALT>
    </StyledWrapper>
  )
}

export default Footer

const StyledWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  color: var(--gray-10);
  a {
    margin-top: 0.5rem;
    cursor: pointer;

    :hover {
      color: var(--gray-12);
    }
  }
`
