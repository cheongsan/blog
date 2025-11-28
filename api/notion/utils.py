"""
Notion 유틸리티 함수들
notion-utils 패키지의 Python 포팅
"""
import re
from urllib.parse import urlencode, quote
from typing import Any, Dict, Optional, List
from datetime import datetime


def id_to_uuid(id: str) -> str:
    """
    Notion ID를 UUID 형식으로 변환
    예: 'abc123def456...' -> 'abc123de-f456-...'
    """
    if not id:
        return id
    
    # 이미 UUID 형식인 경우
    if '-' in id:
        return id
    
    # 32자리 ID를 UUID 형식으로 변환
    id = id.replace('-', '')
    if len(id) == 32:
        return f"{id[:8]}-{id[8:12]}-{id[12:16]}-{id[16:20]}-{id[20:]}"
    
    return id


def uuid_to_id(uuid: str) -> str:
    """UUID 형식에서 하이픈 제거"""
    return uuid.replace('-', '') if uuid else uuid


def get_text_content(value: Any) -> str:
    """
    Notion 속성 값에서 텍스트 콘텐츠 추출
    """
    if not value:
        return ''
    
    if isinstance(value, str):
        return value
    
    if isinstance(value, list):
        text_parts = []
        for item in value:
            if isinstance(item, list) and len(item) > 0:
                text_parts.append(str(item[0]))
            elif isinstance(item, str):
                text_parts.append(item)
        return ''.join(text_parts)
    
    return str(value)


def get_date_value(value: Any) -> Optional[Dict[str, Any]]:
    """
    Notion 날짜 속성에서 날짜 값 추출
    """
    if not value:
        return None
    
    try:
        # Notion date format: [['‌', [['d', {'start_date': '2024-01-01', ...}]]]]
        if isinstance(value, list) and len(value) > 0:
            first_item = value[0]
            if isinstance(first_item, list) and len(first_item) > 1:
                decorations = first_item[1]
                if isinstance(decorations, list):
                    for decoration in decorations:
                        if isinstance(decoration, list) and len(decoration) >= 2:
                            if decoration[0] == 'd':
                                date_obj = decoration[1]
                                if isinstance(date_obj, dict):
                                    return {
                                        'start_date': date_obj.get('start_date'),
                                        'end_date': date_obj.get('end_date'),
                                        'time_zone': date_obj.get('time_zone'),
                                    }
    except (IndexError, TypeError, KeyError):
        pass
    
    return None


def custom_map_image_url(url: str, block: Dict[str, Any]) -> str:
    """
    Notion 이미지 URL을 프록시 URL로 변환
    """
    if not url:
        raise ValueError("URL can't be empty")
    
    # data URL은 그대로 반환
    if url.startswith('data:'):
        return url
    
    # unsplash 이미지는 프록시하지 않음
    if url.startswith('https://images.unsplash.com'):
        return url
    
    # AWS 서명된 URL 처리
    try:
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(url)
        if (parsed.path.startswith('/secure.notion-static.com') and
            parsed.hostname and parsed.hostname.endswith('.amazonaws.com')):
            query_params = parse_qs(parsed.query)
            if all(key in query_params for key in ['X-Amz-Credential', 'X-Amz-Signature', 'X-Amz-Algorithm']):
                url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    except Exception:
        pass
    
    # /images로 시작하면 notion.so 도메인 추가
    if url.startswith('/images'):
        url = f"https://www.notion.so{url}"
    
    # Notion 이미지 프록시 URL 생성
    if not url.startswith('/image'):
        url = f"https://www.notion.so/image/{quote(url, safe='')}"
    else:
        url = f"https://www.notion.so{url}"
    
    # 쿼리 파라미터 추가
    block_id = block.get('id', '')
    parent_table = block.get('parent_table', 'block')
    
    table = 'block' if parent_table == 'space' else parent_table
    if table in ('collection', 'team'):
        table = 'block'
    
    separator = '&' if '?' in url else '?'
    url = f"{url}{separator}table={table}&id={block_id}&cache=v2"
    
    return url


def parse_page_id(id_or_url: str) -> str:
    """
    Notion 페이지 URL 또는 ID에서 페이지 ID 추출
    """
    if not id_or_url:
        return ''
    
    # URL에서 ID 추출
    if id_or_url.startswith('http'):
        # notion.so/xxx-<id> 또는 notion.so/<id> 형식
        match = re.search(r'([a-f0-9]{32})', id_or_url.replace('-', ''))
        if match:
            return match.group(1)
    
    # 하이픈 제거
    return id_or_url.replace('-', '')


def format_date(date_string: Optional[str], format_str: str = '%Y년 %m월 %d일') -> str:
    """날짜 문자열 포맷팅"""
    if not date_string:
        return ''
    
    try:
        dt = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return dt.strftime(format_str)
    except (ValueError, AttributeError):
        return date_string
