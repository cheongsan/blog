import styled from "@emotion/styled"

function ImageLoadingIndicator() {
  return <StyledIndicator aria-hidden="true" />
}

export { ImageLoadingIndicator }

const StyledIndicator = styled.span`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: inherit;
  background: linear-gradient(
    110deg,
    var(--gray-3) 8%,
    var(--gray-4) 18%,
    var(--gray-3) 33%
  );
  background-size: 200% 100%;
  pointer-events: none;
  animation: image-loading-shimmer 1.4s linear infinite;

  &::after {
    border: 2px solid var(--gray-7);
    border-top-color: var(--gray-11);
    border-radius: 9999px;
    width: 1.5rem;
    height: 1.5rem;
    content: "";
    animation: image-loading-spin 0.8s linear infinite;
  }

  @keyframes image-loading-shimmer {
    to {
      background-position-x: -200%;
    }
  }

  @keyframes image-loading-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &::after {
      animation: none;
    }
  }
`
