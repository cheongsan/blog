import styled from "@emotion/styled"
import React, { InputHTMLAttributes } from "react"

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

const SearchInput: React.FC<Props> = ({ ...props }) => {
  return (
    <StyledInput
      className="rounded-full focus:shadow"
      type="text"
      placeholder="Search Keyword..."
      {...props}
    />
  )
}

export default SearchInput

const StyledInput = styled.input`
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    outline-style: none;
    width: 100%;
    background-color: var(--card);
`
