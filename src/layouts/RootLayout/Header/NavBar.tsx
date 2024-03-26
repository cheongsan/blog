import styled from "@emotion/styled"
import Link from "next/link"
import { IconUserCircle } from '@tabler/icons-react';

const NavBar: React.FC = () => {
  const links = [{ id: 1, name: < IconUserCircle size="33" />, to: "/about" }]
  return (
    <StyledWrapper className="">
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <Link href={link.to}>{link.name}</Link>
          </li>
        ))}
      </ul>
    </StyledWrapper>
  )
}

export default NavBar

const StyledWrapper = styled.div`
  flex-shrink: 0;
  ul {
    display: flex;
    flex-direction: row;
    li {
      display: block;
      margin-left: 1rem;
      color: ${({ theme }) => theme.colors.nav_item};
    }
  }
`
