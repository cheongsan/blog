import useMermaidEffect from "@/lib/useMermaidEffect"
import PostDetail from "./post"
import PageDetail from "./page"
import styled from "@emotion/styled"
import usePostQuery from "@/lib/usePostQuery"

type Props = {}

const Detail: React.FC<Props> = () => {
  const data = usePostQuery()
  useMermaidEffect()

  if (!data) return null
  return (
    <StyledWrapper data-type={data.type}>
      {data.type[0] === "Page" && <PageDetail />}
      {data.type[0] !== "Page" && <PostDetail />}
    </StyledWrapper>
  )
}

export default Detail

const StyledWrapper = styled.div`
  padding-bottom: 1rem;

  &[data-type="Paper"] {
    padding: 40px 0;
  }
`
