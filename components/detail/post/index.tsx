import React from "react"
import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./comment"
import Category from "@/components/category"
import styled from "@emotion/styled"
import NotionRenderer from "lib/notion-renderer"
import usePostQuery from "@/lib/usePostQuery"

const commonStyles = `
  max-width: 56rem;
  margin: 0 auto;
`;

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery();

  if (!data) return null;

  const category = (data.category && data.category?.[0]) || undefined;

  return (
    <>
    <StyledWrapper>
      <article>
        {category && (
          <div css={{ marginBottom: "0.5rem" }}>
            <Category readOnly={data.status?.[0] === "PublicOnDetail"}>
              {category}
            </Category>
          </div>
        )}
        {data.type[0] === "Post" && <PostHeader data={data} />}
        <div>
          <NotionRenderer recordMap={data.recordMap} />
        </div>
        {data.type[0] === "Post" && (
          <>
            <CommentBox data={data} />
          </>
        )}
      </article>
      </StyledWrapper>
      <StyledFooter>
        <Footer />
      </StyledFooter>
    </>
  );
};

export default PostDetail;

const StyledWrapper = styled.div`
  ${commonStyles}
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
  border-radius: 1rem;
  background-color: var(--card);
  > article {
    margin: 0 auto;
    max-width: 42rem;
  }
`;

const StyledFooter = styled.div`
  ${commonStyles}
  > a.card-link-alt:hover{
    scale: 0.85;
  }
`;