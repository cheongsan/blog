import React, { useState, useEffect } from 'react';
import styled from "@emotion/styled"

const StyledImage = styled.img`
  display: block;
  margin-top: 0px;
  margin-right: auto;
  border-radius: 50%;
`

const Gravatar = ({ size = 200 }) => {
  const localImageUrl = `gravatar-${size * 2}.png`;
  const defaultImageUrl = 'avatar.svg';

  const [imgSrc, setImgSrc] = useState(defaultImageUrl);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 이미지 로딩을 처리하는 함수
    const loadImage = async () => {
      const img = new Image();
      img.src = localImageUrl; // 로컬 이미지 경로
      img.onload = () => {
        setImgSrc(localImageUrl); // 이미지 로드 성공 시 프로필 이미지로 변경
        setIsLoading(false); // 로딩 완료
      };
      img.onerror = () => {
        setIsLoading(false); // 이미지 로드 실패 시에도 로딩 완료
      };
    };

    loadImage(); // 컴포넌트 마운트 시 이미지 로드 시도
  }, [localImageUrl]);

  return (
    <StyledImage
      src={imgSrc}
      alt="Gravatar"
      width={size}
      height={size}
    />
  )
}

export default Gravatar
