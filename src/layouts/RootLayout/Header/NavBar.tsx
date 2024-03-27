import styled from "@emotion/styled"
import Link from "next/link"
import { IconInbox, IconUserCircle } from '@tabler/icons-react';

const NavBar: React.FC = () => {
  const links = [
    { id: 1, name: < IconInbox size="33" />, to: "/archive", title: "Archive" },
    { id: 2, name: < IconUserCircle size="33" />, to: "/about", title: "Profile" }
  ]
  return (
    <StyledWrapper className="">
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <Link href={link.to} title={link.title}>{link.name}</Link>
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
      padding: 0.5rem;
      margin-left: 1rem;
      color: ${({ theme }) => theme.colors.nav_item};
      border-radius: 0.75rem;
      &:hover {
        scale: 0.9;
        background-color: ${({ theme }) => theme.colors.card_link_click};
      }
    }
  }
`
