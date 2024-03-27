import React from 'react';
import styled from "@emotion/styled"

interface CardLinkProps {
    href: string;
    text: string;
    className?: string;
    rel?: string;
    target?: string;
}

export const CardLink: React.FC<CardLinkProps> = ({ href, className, rel, target, children }) => {
    const defaultClassName = 'card-link';
    const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

    return (
        <StyledWrapper href={href} className={combinedClassName} rel={rel} target={target}>
            {children}
        </StyledWrapper>
    );
};

const StyledWrapper = styled.a`
  &.card-link {
    background: ${({ theme }) => theme.colors.card}};
    transition-property: scale;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;

    &:hover {
      scale: 0.97;
      background-color: ${({ theme }) => theme.colors.card_click}};
    }
  }
`