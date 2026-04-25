"""
Notion 공식 API 클라이언트
https://developers.notion.com/
비공개 데이터베이스 접근을 위한 Integration 토큰 사용
"""
import asyncio
import os
import httpx
from typing import Any, Dict, Optional, List
from datetime import datetime

from .utils import id_to_uuid, uuid_to_id


def get_notion_config():
    """Notion 설정 가져오기"""
    from api.config import NOTION_CONFIG
    return NOTION_CONFIG


class NotionClient:
    """
    Notion 공식 API 비동기 클라이언트
    Integration 토큰을 사용하여 비공개 데이터베이스에 접근
    
    사용 전 설정:
    1. https://www.notion.so/my-integrations 에서 Integration 생성
    2. 데이터베이스 페이지에서 Integration 연결 (Share > Invite)
    3. NOTION_ACCESS_TOKEN 환경변수에 Integration 토큰 설정
    """
    
    BASE_URL = "https://api.notion.com/v1"
    NOTION_VERSION = "2022-06-28"
    
    # 재시도 설정
    MAX_RETRIES = 3
    RETRY_DELAY = 1
    
    def __init__(self, token: Optional[str] = None):
        config = get_notion_config()
        self.token = token or config.get('access_token', '')
        self.client = httpx.AsyncClient(
            headers={
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json',
                'Notion-Version': self.NOTION_VERSION,
            },
            timeout=30.0,
        )
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """API 요청 (재시도 로직 포함)"""
        url = f"{self.BASE_URL}/{endpoint}"
        
        for attempt in range(self.MAX_RETRIES + 1):
            try:
                if method.upper() == 'POST':
                    response = await self.client.post(url, json=data, params=params)
                elif method.upper() == 'PATCH':
                    response = await self.client.patch(url, json=data)
                else:
                    response = await self.client.get(url, params=params)
                
                response.raise_for_status()
                return response.json()
            
            except httpx.HTTPError as e:
                if attempt < self.MAX_RETRIES:
                    await asyncio.sleep(self.RETRY_DELAY * (attempt + 1))
                    continue
                raise NotionAPIError(f"Notion API 요청 실패: {str(e)}")
    
    async def get_database(self, database_id: str) -> Dict[str, Any]:
        """데이터베이스 정보 가져오기"""
        database_id = uuid_to_id(database_id)
        return await self._request('GET', f'databases/{database_id}')
    
    async def query_database(
        self,
        database_id: str,
        filter: Optional[Dict] = None,
        sorts: Optional[List[Dict]] = None,
        start_cursor: Optional[str] = None,
        page_size: int = 100,
    ) -> Dict[str, Any]:
        """
        데이터베이스 쿼리
        
        Args:
            database_id: 데이터베이스 ID
            filter: 필터 조건
            sorts: 정렬 조건
            start_cursor: 페이지네이션 커서
            page_size: 페이지 크기 (최대 100)
        """
        database_id = uuid_to_id(database_id)
        
        data = {}
        if filter:
            data['filter'] = filter
        if sorts:
            data['sorts'] = sorts
        if start_cursor:
            data['start_cursor'] = start_cursor
        if page_size:
            data['page_size'] = min(page_size, 100)
        
        return await self._request('POST', f'databases/{database_id}/query', data=data)
    
    async def query_database_all(
        self,
        database_id: str,
        filter: Optional[Dict] = None,
        sorts: Optional[List[Dict]] = None,
    ) -> List[Dict[str, Any]]:
        """
        데이터베이스의 모든 항목 쿼리 (페이지네이션 자동 처리)
        """
        all_results = []
        start_cursor = None
        
        while True:
            response = await self.query_database(
                database_id=database_id,
                filter=filter,
                sorts=sorts,
                start_cursor=start_cursor,
            )
            
            all_results.extend(response.get('results', []))
            
            if not response.get('has_more'):
                break
            
            start_cursor = response.get('next_cursor')
        
        return all_results
    
    async def get_page(self, page_id: str) -> Dict[str, Any]:
        """페이지 정보 가져오기"""
        page_id = uuid_to_id(page_id)
        return await self._request('GET', f'pages/{page_id}')
    
    async def get_block_children(
        self,
        block_id: str,
        start_cursor: Optional[str] = None,
        page_size: int = 100,
    ) -> Dict[str, Any]:
        """블록의 자식 블록들 가져오기"""
        block_id = uuid_to_id(block_id)
        params = {'page_size': min(page_size, 100)}
        if start_cursor:
            params['start_cursor'] = start_cursor
        
        return await self._request('GET', f'blocks/{block_id}/children', params=params)
    
    async def get_all_block_children(self, block_id: str) -> List[Dict[str, Any]]:
        """블록의 모든 자식 블록 가져오기 (페이지네이션 자동 처리)"""
        all_blocks = []
        start_cursor = None
        
        while True:
            response = await self.get_block_children(block_id, start_cursor)
            all_blocks.extend(response.get('results', []))
            
            if not response.get('has_more'):
                break
            
            start_cursor = response.get('next_cursor')
        
        return all_blocks
    
    async def search(
        self,
        query: str = "",
        filter: Optional[Dict] = None,
        sort: Optional[Dict] = None,
        start_cursor: Optional[str] = None,
        page_size: int = 100,
    ) -> Dict[str, Any]:
        """워크스페이스 검색"""
        data = {'page_size': min(page_size, 100)}
        if query:
            data['query'] = query
        if filter:
            data['filter'] = filter
        if sort:
            data['sort'] = sort
        if start_cursor:
            data['start_cursor'] = start_cursor
        
        return await self._request('POST', 'search', data=data)


class NotionAPIError(Exception):
    """Notion API 오류"""
    pass


def parse_notion_properties(page: Dict[str, Any]) -> Dict[str, Any]:
    """
    Notion 페이지 속성을 파싱하여 간단한 딕셔너리로 변환
    """
    properties = page.get('properties', {})
    result = {
        'id': page.get('id', ''),
        'created_time': page.get('created_time', ''),
        'last_edited_time': page.get('last_edited_time', ''),
    }
    
    for name, prop in properties.items():
        prop_type = prop.get('type')
        
        if prop_type == 'title':
            texts = prop.get('title', [])
            result[name] = ''.join(t.get('plain_text', '') for t in texts)
        
        elif prop_type == 'rich_text':
            texts = prop.get('rich_text', [])
            result[name] = ''.join(t.get('plain_text', '') for t in texts)
        
        elif prop_type == 'number':
            result[name] = prop.get('number')
        
        elif prop_type == 'select':
            select = prop.get('select')
            result[name] = [select.get('name')] if select else []
        
        elif prop_type == 'multi_select':
            result[name] = [s.get('name') for s in prop.get('multi_select', [])]
        
        elif prop_type == 'status':
            status = prop.get('status')
            result[name] = [status.get('name')] if status else []
        
        elif prop_type == 'date':
            date = prop.get('date')
            if date:
                result[name] = {
                    'start_date': date.get('start'),
                    'end_date': date.get('end'),
                    'time_zone': date.get('time_zone'),
                }
            else:
                result[name] = None
        
        elif prop_type == 'checkbox':
            result[name] = prop.get('checkbox', False)
        
        elif prop_type == 'url':
            result[name] = prop.get('url')
        
        elif prop_type == 'email':
            result[name] = prop.get('email')
        
        elif prop_type == 'phone_number':
            result[name] = prop.get('phone_number')
        
        elif prop_type == 'files':
            files = prop.get('files', [])
            if files:
                # 첫 번째 파일의 URL 반환
                file = files[0]
                if file.get('type') == 'external':
                    result[name] = file.get('external', {}).get('url')
                elif file.get('type') == 'file':
                    result[name] = file.get('file', {}).get('url')
                else:
                    result[name] = None
            else:
                result[name] = None
        
        elif prop_type == 'people':
            result[name] = [
                {
                    'id': p.get('id'),
                    'name': p.get('name'),
                    'avatar_url': p.get('avatar_url'),
                }
                for p in prop.get('people', [])
            ]
        
        elif prop_type == 'relation':
            result[name] = [r.get('id') for r in prop.get('relation', [])]
        
        elif prop_type == 'formula':
            formula = prop.get('formula', {})
            formula_type = formula.get('type')
            result[name] = formula.get(formula_type)
        
        elif prop_type == 'rollup':
            rollup = prop.get('rollup', {})
            rollup_type = rollup.get('type')
            result[name] = rollup.get(rollup_type)
        
        elif prop_type == 'created_time':
            result[name] = prop.get('created_time')
        
        elif prop_type == 'last_edited_time':
            result[name] = prop.get('last_edited_time')
        
        elif prop_type == 'created_by':
            result[name] = prop.get('created_by', {}).get('id')
        
        elif prop_type == 'last_edited_by':
            result[name] = prop.get('last_edited_by', {}).get('id')
    
    return result
