import styled from "@emotion/styled"
import Link from "next/link"
import { TbInbox, TbUserCircle } from 'react-icons/tb';

const NavBar: React.FC = () => {
  const links = [
    { id: 1, name: < TbInbox size="33" />, to: "/archive", title: "Archive" },
    { id: 2, name: < TbUserCircle size="33" />, to: "/about", title: "Profile" }
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
      color: var(--nav-item);
      border-radius: 0.75rem;
      transition-property: scale;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
      &:hover {
        scale: 0.9;
        background-color: var(--card-link-click);
      }
    }
  }
`
