import React from "react"
import { useRouter } from "next/router"
import { MdExpandMore } from "react-icons/md"
import styled from "@emotion/styled"
import { DEFAULT_CATEGORY } from "@/constants"
import { useCategoriesQuery } from "@/lib/useCategoriesQuery"
import IconRenderer from "@/components/category/IconRenderer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Props = {}

const CategorySelect: React.FC<Props> = () => {
  const router = useRouter()
  const data = useCategoriesQuery()

  const currentCategory = `${router.query.category || ``}` || DEFAULT_CATEGORY

  const handleOptionClick = (category: string) => {
    router.push({
      query: {
        ...router.query,
        category,
      },
    })
  }

  return (
      <StyledWrapper>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-pointer text-xl font-bold mt-2 mb-2">
              <IconRenderer category={currentCategory} size={27} />
              &nbsp;Posts
              <MdExpandMore />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="content">
            {Object.keys(data).map((key, idx) => (
                <DropdownMenuItem
                    key={idx}
                    className="flex item items-center gap-1.5 cursor-pointer"
                    onClick={() => handleOptionClick(key)}
                >
                  <IconRenderer category={key} />
                  {`(${data[key]})`}
                </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </StyledWrapper>
  )
}

export default CategorySelect

const StyledWrapper = styled.div`
  position: relative;

  > .content {
    background-color: var(--gray-2)!important;
    color: var(--gray-10)!important;

    > .item {
      :hover {
        background-color: var(--gray-4);
      }

      >svg {
        margin-right: 0.25rem;
      }
    }
  }
`
