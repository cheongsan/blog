import styled from "@emotion/styled"

function ImageLoadingIndicator() {
  return <StyledIndicator aria-hidden="true" />
}

export { ImageLoadingIndicator }

const StyledIndicator = styled.span`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
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

  @keyframes image-loading-shimmer {
    to {
      background-position-x: -200%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
