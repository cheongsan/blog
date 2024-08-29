import React, { ReactNode } from 'react';
import styled from "@emotion/styled"

interface Props {
  href?: string;
  text?: string;
  className?: string;
  rel?: string;
  target?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export const CardLink: React.FC<Props> = ({ href, className, rel, target, children, onClick }) => {
    const defaultClassName = 'card-link';
    const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

    return (
      <StyledWrapper href={href} className={combinedClassName} rel={rel} target={target} onClick={onClick}>
        {children}
      </StyledWrapper>
    );
};

const StyledWrapper = styled.a`
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
`