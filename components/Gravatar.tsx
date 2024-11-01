import React, { useState, useEffect } from 'react';
import styled from "@emotion/styled";

const StyledImage = styled.img`
  display: block;
  margin-top: 0px;
  margin-right: auto;
  border-radius: 50%;
`;

const Gravatar = ({ size = 200 }) => {
  const localImageUrl = `gravatar-${size * 2}.png`;
  const defaultImageUrl = 'avatar.svg';

  const [imgSrc, setImgSrc] = useState(localImageUrl);

  useEffect(() => {
    const img = new Image();
    img.src = localImageUrl;

    img.onload = () => setImgSrc(localImageUrl);  // 이미지 로드 성공 시
    img.onerror = () => setImgSrc(defaultImageUrl);  // 이미지 로드 실패 시

  }, [localImageUrl]);

  return (
      <StyledImage
          src={imgSrc}
          alt="Gravatar"
          width={size}
          height={size}
      />
  );
};

export default Gravatar;
