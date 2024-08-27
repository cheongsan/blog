import styled from "@emotion/styled"
import React from 'react';
import { CONFIG } from "site.config"
import md5 from 'md5';

const StyledImage = styled.img`
    display: block;
    margin-top: 0px;
    margin-right: auto;
    border-top-left-radius: 50%;
    border-top-right-radius: 50%;
    border-bottom-right-radius: 50%;
    border-bottom-left-radius: 50%;
`;

const Gravatar = ({ size = 200 }) => {
    // 이메일 해시 생성 (사용자 이름을 이메일로 가정)
    const hash = md5(CONFIG.profile.gravatar_email);

    // Gravatar 이미지 URL 생성
    const imageUrl = `https://www.gravatar.com/avatar/${hash}?s=${size*2}&d=identicon`;

    return <StyledImage src={imageUrl} alt={`${CONFIG.profile.gravatar}'s Gravatar`} width={size} height={size} />;
};

export default Gravatar;