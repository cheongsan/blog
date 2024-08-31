import React from "react"
import styled from "@emotion/styled"
import { useRouter } from "next/router"
import { FaHashtag } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";

type Props = {
  children: string
}

const Tag: React.FC<Props> = ({ children }) => {
  const router = useRouter()
  const handleClick = (value: string) => {
    router.push(`/archive?tag=${value}`)
  }

  return (
      <StyledBadge
          onClick={() => handleClick(children)}
                   className="flex rounded-full bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-500 shadow-none">
        <FaHashtag className="me-1" />
        {children}
      </StyledBadge>
  )
}

export default Tag

const StyledBadge = styled(Badge)`
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 400;
  cursor: pointer;
`
