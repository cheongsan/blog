import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React from "react"
import { TbSortDescending, TbSortAscending } from "react-icons/tb"

type TOrder = "asc" | "desc"

type Props = {}

const OrderButtons: React.FC<Props> = () => {
  const router = useRouter()

  const currentOrder = `${router.query.order || ``}` || ("desc" as TOrder)

  const handleClickOrderBy = (value: TOrder) => {
    router.push({
      query: {
        ...router.query,
        order: value,
      },
    })
  }
  return (
    <StyledWrapper>
      <a
        data-active={currentOrder === "desc"}
        onClick={() => handleClickOrderBy("desc")}
      >
        < TbSortDescending size="17" /> Desc
      </a>
      <a
        data-active={currentOrder === "asc"}
        onClick={() => handleClickOrderBy("asc")}
      >
        < TbSortAscending size="17" /> Asc
      </a>
    </StyledWrapper>
  )
}

export default OrderButtons

const StyledWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  a {
    display: flex;  
    cursor: pointer;
    color: var(--gray-10);

    &[data-active="true"] {
      font-weight: 700;

      color: var(--gray-12);
    }
  }
`
