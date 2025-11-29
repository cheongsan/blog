import hashlib
import requests
from django.conf import settings


def get_gravatar_url_by_email(email, size=512):
    """
    이메일 주소를 사용하여 Gravatar 프로필 이미지 URL을 반환합니다.
    
    Args:
        email: 이메일 주소
        size: 이미지 크기 (기본값: 512px)
    
    Returns:
        Gravatar 이미지 URL
    """
    if not email:
        return None
    
    # 이메일 주소를 소문자로 변환하고 MD5 해시 생성
    email_hash = hashlib.md5(email.lower().strip().encode()).hexdigest()
    return f"https://www.gravatar.com/avatar/{email_hash}?s={size}&d=identicon&r=g"


def get_gravatar_url(username, size=512):
    """
    Gravatar 프로필 이미지 고화질 URL을 반환합니다.
    
    Args:
        username: Gravatar 사용자명
        size: 이미지 크기 (기본값: 512px)
    
    Returns:
        Gravatar 고화질 이미지 URL (CDN)
    """
    if not username:
        return None
    
    try:
        # Gravatar 프로필 JSON API에서 이미지 URL 추출
        profile_url = f"https://www.gravatar.com/{username}.json"
        response = requests.get(profile_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # entry 배열에서 첫 번째 항목의 photo 반환
            if 'entry' in data and len(data['entry']) > 0:
                photos = data['entry'][0].get('photos', [])
                if photos:
                    # 원본 Gravatar URL (고화질)
                    original_url = photos[0]['value']
                    return f"{original_url}?s={size}&d=identicon&r=g"
        
        # 프로필 API 실패시 hash 기반 고화질 URL 사용
        username_hash = hashlib.md5(username.lower().encode()).hexdigest()
        # 고화질 CDN URL (1.gravatar.com 사용)
        return f"https://1.gravatar.com/avatar/{username_hash}?s={size}&d=identicon&r=g"
    
    except Exception as e:
        print(f"Error getting Gravatar URL: {e}")
        # 폴백: 고화질 CDN URL 반환
        username_hash = hashlib.md5(username.lower().encode()).hexdigest()
        return f"https://1.gravatar.com/avatar/{username_hash}?s={size}&d=identicon&r=g"
