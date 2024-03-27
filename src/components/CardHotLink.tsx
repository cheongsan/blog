import React, { ReactNode } from 'react';
import styled from "@emotion/styled"

interface CardHotLinkProps {
    href: string;
    text?: string;
    className?: string;
    rel?: string;
    target?: string;
    children?: ReactNode;
}

export const CardHotLink: React.FC<CardHotLinkProps> = ({ href, className, rel, target, children }) => {
    const defaultClassName = 'card-hot-link';
    const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

    return (
        <StyledWrapper href={href} className={combinedClassName} rel={rel} target={target}>
            {children}
        </StyledWrapper>
    );
};

const StyledWrapper = styled.a`
  &.card-hot-link {
    display: inline-flex;
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem;
    font-weight: 500;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.card_link}};
    border-radius: 0.75rem;
    transition-property: scale;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;

    &:hover {
      scale: 0.97;
      background-color: ${({ theme }) => theme.colors.card_link_click}};
    }
  }
`