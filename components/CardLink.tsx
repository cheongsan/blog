import React, { ReactNode } from 'react';
import styled from "@emotion/styled"
import Link from "next/link"

interface Props {
  href?: string;
  className?: string;
  rel?: string;
  target?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export const CardLink: React.FC<Props> = ({ href, className, rel, target, children, onClick }) => {
    const defaultClassName = 'card-link';
    const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

    const isExternal = href?.startsWith('http') || href?.startsWith('//');

    if (isExternal || !href) {
      return (
        <StyledA href={href} className={combinedClassName} rel={rel} target={target} onClick={onClick}>
          {children}
        </StyledA>
      );
    }

    return (
      <StyledLink href={href} className={combinedClassName} onClick={onClick}>
        {children}
      </StyledLink>
    );
};

const linkStyles = `
  &.card-link {
    background: var(--card);
    transition-property: scale;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
    &:hover {
      scale: 0.97;
      background-color: var(--card-click);
    }
  }
`;

const StyledA = styled.a`${linkStyles}`;
const StyledLink = styled(Link)`${linkStyles}`;
