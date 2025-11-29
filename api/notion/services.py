"""
Notion 서비스 레이어
비즈니스 로직을 처리하는 서비스 클래스들
공식 Notion API만 사용
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from .client import NotionClient, NotionAPIError, parse_notion_properties
from .utils import id_to_uuid


def get_cache():
    """Django 캐시 가져오기 (lazy import)"""
    try:
        from django.core.cache import cache
        return cache
    except Exception:
        return None


def get_notion_config():
    """Notion 설정 가져오기"""
    try:
        from django.conf import settings
        return settings.NOTION_CONFIG
    except Exception:
        return {
            'page_id': os.environ.get('NOTION_PAGE_ID', ''),
            'access_token': os.environ.get('NOTION_ACCESS_TOKEN', ''),
        }


# 타입 정의
PostStatus = str  # "Private" | "Public" | "PublicOnDetail" | "Pinned" | "Archived"
PostType = str    # "Post" | "Paper" | "Page"


class NotionService:
    """
    Notion 블로그 서비스 (공식 API 전용)
    포스트 목록 조회, 필터링, 상세 조회 등의 비즈니스 로직 처리
    
    사용 방법:
    1. https://www.notion.so/my-integrations 에서 Integration 생성
    2. 데이터베이스 페이지에서 Integration 연결 (우측 상단 ... > Connect to)
    3. NOTION_ACCESS_TOKEN에 Integration 토큰 설정 (secret_xxx 형식)
    """
    
    # 캐시 설정 (초)
    POSTS_CACHE_TIMEOUT = 60 * 5  # 5분
    POST_DETAIL_CACHE_TIMEOUT = 60 * 10  # 10분
    
    def __init__(self, page_id: Optional[str] = None):
        config = get_notion_config()
        self.page_id = page_id or config.get('page_id', '')
        self.client = NotionClient()
    
    def get_posts(self, use_cache: bool = True) -> List[Dict[str, Any]]:
        """
        모든 포스트 목록 가져오기 (공식 API 사용)
        
        Args:
            use_cache: 캐시 사용 여부
            
        Returns:
            포스트 목록 (날짜순 정렬)
        """
        cache = get_cache()
        cache_key = f"notion_posts_{self.page_id}"
        
        if use_cache and cache:
            cached = cache.get(cache_key)
            if cached:
                return cached
        
        try:
            # 데이터베이스 쿼리
            pages = self.client.query_database_all(
                database_id=self.page_id,
                sorts=[{'property': 'date', 'direction': 'descending'}]
            )
            
            posts = []
            for page in pages:
                properties = parse_notion_properties(page)
                
                # 필드명 정규화 (대소문자 통일)
                normalized = {'id': properties.get('id', '')}
                for key, value in properties.items():
                    # title 필드를 찾아서 'title'로 매핑
                    if key.lower() == 'name' or key.lower() == 'title' or key.lower() == '이름':
                        normalized['title'] = value
                    else:
                        normalized[key.lower()] = value
                
                # createdTime 추가
                normalized['createdTime'] = properties.get('created_time', '')
                normalized['fullWidth'] = False
                
                posts.append(normalized)
            
            # 날짜순 정렬
            posts.sort(key=lambda x: self._get_post_date(x), reverse=True)
            
            # 캐시 저장
            if use_cache and cache:
                cache.set(cache_key, posts, self.POSTS_CACHE_TIMEOUT)
            
            return posts
        
        except NotionAPIError as e:
            print(f"Notion API 오류: {e}")
            return []
    
    def get_post_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """슬러그로 포스트 조회"""
        posts = self.get_posts()
        for post in posts:
            if post.get('slug') == slug:
                return post
        return None
    
    def get_post_detail(self, post_id: str) -> Optional[Dict[str, Any]]:
        """
        포스트 상세 정보 가져오기 (블록 내용 포함)
        
        Args:
            post_id: 포스트 ID
            
        Returns:
            포스트 상세 정보 및 블록 데이터
        """
        cache = get_cache()
        cache_key = f"notion_post_detail_{post_id}"
        
        if cache:
            cached = cache.get(cache_key)
            if cached:
                return cached
        
        try:
            # 페이지 정보 가져오기
            page = self.client.get_page(post_id)
            
            # 모든 블록 (자식 포함) 재귀적으로 가져오기
            blocks = self._get_all_blocks_recursive(post_id)
            
            # 포스트 기본 정보 가져오기
            posts = self.get_posts()
            post = next((p for p in posts if p.get('id') == post_id), None)
            
            # 블록을 HTML로 렌더링
            from .renderer import render_notion_blocks
            rendered_content = render_notion_blocks(blocks)
            
            if post:
                result = {
                    **post,
                    'page': page,
                    'blocks': blocks,
                    'content_html': rendered_content,
                }
                if cache:
                    cache.set(cache_key, result, self.POST_DETAIL_CACHE_TIMEOUT)
                return result
            
            return {'page': page, 'blocks': blocks, 'content_html': rendered_content}
        
        except NotionAPIError as e:
            print(f"Notion API 오류: {e}")
            return None
    
    def _get_all_blocks_recursive(self, block_id: str, depth: int = 0, max_depth: int = 5) -> List[Dict[str, Any]]:
        """
        블록과 자식 블록을 재귀적으로 모두 가져오기
        
        Args:
            block_id: 블록 ID
            depth: 현재 깊이
            max_depth: 최대 깊이
            
        Returns:
            모든 블록 리스트 (평탄화됨)
        """
        if depth > max_depth:
            return []
        
        all_blocks = []
        blocks = self.client.get_all_block_children(block_id)
        
        for block in blocks:
            all_blocks.append(block)
            
            # 자식이 있는 블록인 경우 재귀적으로 가져오기
            if block.get('has_children', False):
                child_blocks = self._get_all_blocks_recursive(
                    block.get('id', ''), 
                    depth + 1, 
                    max_depth
                )
                # 자식 블록들을 부모 블록에 첨부
                block['children'] = child_blocks
        
        return all_blocks
    
    def filter_posts(
        self,
        posts: List[Dict[str, Any]],
        accept_status: Optional[List[PostStatus]] = None,
        accept_type: Optional[List[PostType]] = None,
    ) -> List[Dict[str, Any]]:
        """
        포스트 필터링
        
        Args:
            posts: 포스트 목록
            accept_status: 허용할 상태 목록
            accept_type: 허용할 타입 목록
            
        Returns:
            필터링된 포스트 목록
        """
        if accept_status is None:
            accept_status = ["Public", "Pinned", "Archived"]
        if accept_type is None:
            accept_type = ["Post"]
        
        # 내일 자정 (미래 포스트 필터링용) - timezone-aware
        tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
        tomorrow = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
        
        filtered = []
        for post in posts:
            # 필수 필드 확인
            if not post.get('title') or not post.get('slug'):
                continue
            
            # 미래 날짜 포스트 제외
            post_date = self._get_post_date(post)
            if post_date > tomorrow:
                continue
            
            # 상태 필터
            post_status = post.get('status', [])
            if isinstance(post_status, list) and post_status:
                if post_status[0] not in accept_status:
                    continue
            else:
                continue
            
            # 타입 필터
            post_type = post.get('type', [])
            if isinstance(post_type, list) and post_type:
                if post_type[0] not in accept_type:
                    continue
            else:
                continue
            
            filtered.append(post)
        
        return filtered
    
    def get_public_posts(self) -> List[Dict[str, Any]]:
        """공개 포스트만 가져오기 (Public, Pinned)"""
        posts = self.get_posts()
        return self.filter_posts(posts, accept_status=["Public", "Pinned"])
    
    def get_all_posts(self) -> List[Dict[str, Any]]:
        """모든 공개 포스트 가져오기 (Public, Pinned, Archived)"""
        posts = self.get_posts()
        return self.filter_posts(posts, accept_status=["Public", "Pinned", "Archived"])
    
    def get_pinned_posts(self) -> List[Dict[str, Any]]:
        """고정 포스트만 가져오기"""
        posts = self.get_posts()
        return self.filter_posts(posts, accept_status=["Pinned"])
    
    def get_archived_posts(self) -> List[Dict[str, Any]]:
        """아카이브 포스트 가져오기"""
        posts = self.get_posts()
        return self.filter_posts(posts, accept_status=["Archived"])
    
    def get_all_tags(self, posts: Optional[List[Dict[str, Any]]] = None) -> Dict[str, int]:
        """
        모든 태그와 개수 가져오기
        
        Returns:
            {태그명: 포스트 수} 딕셔너리
        """
        if posts is None:
            posts = self.get_public_posts()
        return self._get_all_select_items(posts, 'tags')
    
    def get_all_categories(self, posts: Optional[List[Dict[str, Any]]] = None) -> Dict[str, int]:
        """
        모든 카테고리와 개수 가져오기
        
        Returns:
            {카테고리명: 포스트 수} 딕셔너리
        """
        if posts is None:
            posts = self.get_public_posts()
        return self._get_all_select_items(posts, 'category')
    
    def get_posts_by_tag(self, tag: str) -> List[Dict[str, Any]]:
        """특정 태그의 포스트 목록"""
        posts = self.get_public_posts()
        return [p for p in posts if tag in (p.get('tags') or [])]
    
    def get_posts_by_category(self, category: str) -> List[Dict[str, Any]]:
        """특정 카테고리의 포스트 목록"""
        posts = self.get_public_posts()
        return [p for p in posts if category in (p.get('category') or [])]
    
    # === Private Methods ===
    
    def _get_all_select_items(
        self,
        posts: List[Dict[str, Any]],
        key: str
    ) -> Dict[str, int]:
        """특정 키의 select 항목들과 개수 집계"""
        items = {}
        for post in posts:
            values = post.get(key, [])
            if isinstance(values, list):
                for value in values:
                    if value:
                        items[value] = items.get(value, 0) + 1
        return items
    
    def _get_post_date(self, post: Dict[str, Any]) -> datetime:
        """포스트 날짜 추출 (timezone-aware datetime 반환)"""
        date_info = post.get('date', {})
        if date_info and date_info.get('start_date'):
            try:
                dt = datetime.fromisoformat(date_info['start_date'])
                # timezone-naive이면 UTC로 설정
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except ValueError:
                pass
        
        created_time = post.get('createdTime', '')
        if created_time:
            try:
                dt = datetime.fromisoformat(created_time.replace('Z', '+00:00'))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except ValueError:
                pass
        
        return datetime.min.replace(tzinfo=timezone.utc)
    
    def clear_cache(self):
        """캐시 초기화"""
        cache = get_cache()
        if cache:
            cache.delete(f"notion_posts_{self.page_id}")


# 싱글톤 인스턴스
_notion_service: Optional[NotionService] = None


def get_notion_service() -> NotionService:
    """NotionService 싱글톤 인스턴스 반환"""
    global _notion_service
    if _notion_service is None:
        _notion_service = NotionService()
    return _notion_service
