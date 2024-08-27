import styled from "@emotion/styled"
import React from "react"
import { TbMoon, TbSun } from 'react-icons/tb';
import useScheme from "src/hooks/useScheme"

type Props = {}

const ThemeToggle: React.FC<Props> = () => {
  const [scheme, setScheme] = useScheme()

  const handleClick = () => {
    setScheme(scheme === "light" ? "dark" : "light")
  }

  return (
    <StyledWrapper onClick={handleClick}>
      {scheme === "light" ? <TbSun /> : <TbMoon />}
    </StyledWrapper>
  )
}

export default ThemeToggle

const StyledWrapper = styled.div`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray10};
`
