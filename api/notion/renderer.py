"""
Notion 블록을 HTML로 렌더링하는 모듈
공식 Notion API의 블록 데이터를 HTML로 변환
"""
from typing import Any, Dict, List, Optional
from urllib.parse import quote
import html


class NotionBlockRenderer:
    """Notion 블록을 HTML로 렌더링"""
    
    def __init__(self, blocks: List[Dict[str, Any]]):
        self.blocks = blocks
    
    def render(self) -> str:
        """모든 블록을 HTML로 렌더링"""
        html_parts = []
        i = 0
        while i < len(self.blocks):
            block = self.blocks[i]
            rendered, skip = self._render_block(block, i)
            html_parts.append(rendered)
            i += 1 + skip
        return '\n'.join(html_parts)
    
    def _render_block(self, block: Dict[str, Any], index: int) -> tuple[str, int]:
        """
        개별 블록을 HTML로 렌더링
        Returns: (html_string, blocks_to_skip)
        """
        block_type = block.get('type', '')
        block_id = block.get('id', '')
        
        renderer_map = {
            'paragraph': self._render_paragraph,
            'heading_1': self._render_heading_1,
            'heading_2': self._render_heading_2,
            'heading_3': self._render_heading_3,
            'bulleted_list_item': self._render_bulleted_list_item,
            'numbered_list_item': self._render_numbered_list_item,
            'to_do': self._render_to_do,
            'toggle': self._render_toggle,
            'code': self._render_code,
            'quote': self._render_quote,
            'callout': self._render_callout,
            'divider': self._render_divider,
            'image': self._render_image,
            'video': self._render_video,
            'file': self._render_file,
            'pdf': self._render_pdf,
            'bookmark': self._render_bookmark,
            'embed': self._render_embed,
            'equation': self._render_equation,
            'table': self._render_table,
            'table_row': self._render_table_row,
            'column_list': self._render_column_list,
            'column': self._render_column,
            'synced_block': self._render_synced_block,
            'template': self._render_template,
            'link_to_page': self._render_link_to_page,
            'table_of_contents': self._render_table_of_contents,
            'breadcrumb': self._render_breadcrumb,
            'child_page': self._render_child_page,
            'child_database': self._render_child_database,
        }
        
        renderer = renderer_map.get(block_type)
        if renderer:
            # 리스트 아이템의 경우 연속된 아이템을 그룹화
            if block_type in ('bulleted_list_item', 'numbered_list_item'):
                return self._render_list_group(block_type, index)
            return renderer(block), 0
        
        return f'<!-- Unsupported block type: {block_type} -->', 0
    
    def _render_list_group(self, list_type: str, start_index: int) -> tuple[str, int]:
        """연속된 리스트 아이템을 그룹화하여 렌더링"""
        items = []
        i = start_index
        
        while i < len(self.blocks) and self.blocks[i].get('type') == list_type:
            block = self.blocks[i]
            if list_type == 'bulleted_list_item':
                content = self._render_rich_text(block.get('bulleted_list_item', {}).get('rich_text', []))
            else:
                content = self._render_rich_text(block.get('numbered_list_item', {}).get('rich_text', []))
            items.append(f'<li>{content}</li>')
            i += 1
        
        tag = 'ul' if list_type == 'bulleted_list_item' else 'ol'
        list_class = 'notion-list-disc' if list_type == 'bulleted_list_item' else 'notion-list-numbered'
        
        return f'<{tag} class="{list_class}">\n{"".join(items)}\n</{tag}>', i - start_index - 1
    
    def _render_rich_text(self, rich_text: List[Dict[str, Any]]) -> str:
        """Rich text 배열을 HTML로 렌더링"""
        if not rich_text:
            return ''
        
        parts = []
        for text_obj in rich_text:
            text = html.escape(text_obj.get('plain_text', ''))
            annotations = text_obj.get('annotations', {})
            href = text_obj.get('href')
            
            # 어노테이션 적용
            if annotations.get('code'):
                text = f'<code class="notion-inline-code">{text}</code>'
            if annotations.get('bold'):
                text = f'<strong>{text}</strong>'
            if annotations.get('italic'):
                text = f'<em>{text}</em>'
            if annotations.get('strikethrough'):
                text = f'<del>{text}</del>'
            if annotations.get('underline'):
                text = f'<u>{text}</u>'
            
            # 색상 처리
            color = annotations.get('color', 'default')
            if color != 'default':
                if color.endswith('_background'):
                    bg_color = color.replace('_background', '')
                    text = f'<span class="notion-{bg_color}-bg">{text}</span>'
                else:
                    text = f'<span class="notion-{color}">{text}</span>'
            
            # 링크 처리
            if href:
                text = f'<a href="{html.escape(href)}" class="notion-link" target="_blank" rel="noopener noreferrer">{text}</a>'
            
            parts.append(text)
        
        return ''.join(parts)
    
    def _render_paragraph(self, block: Dict[str, Any]) -> str:
        """paragraph 블록 렌더링"""
        content = self._render_rich_text(block.get('paragraph', {}).get('rich_text', []))
        if not content:
            return '<p class="notion-blank">&nbsp;</p>'
        return f'<p class="notion-text">{content}</p>'
    
    def _render_heading_1(self, block: Dict[str, Any]) -> str:
        """heading_1 블록 렌더링"""
        data = block.get('heading_1', {})
        content = self._render_rich_text(data.get('rich_text', []))
        block_id = block.get('id', '').replace('-', '')
        return f'<h1 id="{block_id}" class="notion-h notion-h1">{content}</h1>'
    
    def _render_heading_2(self, block: Dict[str, Any]) -> str:
        """heading_2 블록 렌더링"""
        data = block.get('heading_2', {})
        content = self._render_rich_text(data.get('rich_text', []))
        block_id = block.get('id', '').replace('-', '')
        return f'<h2 id="{block_id}" class="notion-h notion-h2">{content}</h2>'
    
    def _render_heading_3(self, block: Dict[str, Any]) -> str:
        """heading_3 블록 렌더링"""
        data = block.get('heading_3', {})
        content = self._render_rich_text(data.get('rich_text', []))
        block_id = block.get('id', '').replace('-', '')
        return f'<h3 id="{block_id}" class="notion-h notion-h3">{content}</h3>'
    
    def _render_bulleted_list_item(self, block: Dict[str, Any]) -> str:
        """bulleted_list_item 블록 렌더링 (개별)"""
        content = self._render_rich_text(block.get('bulleted_list_item', {}).get('rich_text', []))
        return f'<li>{content}</li>'
    
    def _render_numbered_list_item(self, block: Dict[str, Any]) -> str:
        """numbered_list_item 블록 렌더링 (개별)"""
        content = self._render_rich_text(block.get('numbered_list_item', {}).get('rich_text', []))
        return f'<li>{content}</li>'
    
    def _render_to_do(self, block: Dict[str, Any]) -> str:
        """to_do 블록 렌더링"""
        data = block.get('to_do', {})
        content = self._render_rich_text(data.get('rich_text', []))
        checked = data.get('checked', False)
        checked_class = 'notion-to-do-checked' if checked else ''
        checked_attr = 'checked' if checked else ''
        return f'''<div class="notion-to-do {checked_class}">
            <input type="checkbox" {checked_attr} disabled />
            <span>{content}</span>
        </div>'''
    
    def _render_toggle(self, block: Dict[str, Any]) -> str:
        """toggle 블록 렌더링"""
        data = block.get('toggle', {})
        content = self._render_rich_text(data.get('rich_text', []))
        return f'''<details class="notion-toggle">
            <summary>{content}</summary>
            <div class="notion-toggle-content"></div>
        </details>'''
    
    def _render_code(self, block: Dict[str, Any]) -> str:
        """code 블록 렌더링"""
        data = block.get('code', {})
        content = self._render_rich_text(data.get('rich_text', []))
        language = data.get('language', 'plain text')
        caption = self._render_rich_text(data.get('caption', []))
        
        # HTML 이스케이프된 내용에서 태그 제거 (코드 블록에서는 plain text만 필요)
        plain_content = ''
        for text_obj in data.get('rich_text', []):
            plain_content += html.escape(text_obj.get('plain_text', ''))
        
        result = f'''<pre class="notion-code">
<code class="language-{html.escape(language)}">{plain_content}</code>
</pre>'''
        if caption:
            result += f'<figcaption class="notion-caption">{caption}</figcaption>'
        return result
    
    def _render_quote(self, block: Dict[str, Any]) -> str:
        """quote 블록 렌더링"""
        content = self._render_rich_text(block.get('quote', {}).get('rich_text', []))
        return f'<blockquote class="notion-quote">{content}</blockquote>'
    
    def _render_callout(self, block: Dict[str, Any]) -> str:
        """callout 블록 렌더링"""
        data = block.get('callout', {})
        content = self._render_rich_text(data.get('rich_text', []))
        icon = data.get('icon', {})
        color = data.get('color', 'gray_background')
        
        icon_html = ''
        if icon.get('type') == 'emoji':
            icon_html = f'<span class="notion-callout-icon">{icon.get("emoji", "💡")}</span>'
        elif icon.get('type') == 'external':
            icon_url = icon.get('external', {}).get('url', '')
            icon_html = f'<img src="{html.escape(icon_url)}" class="notion-callout-icon" alt="" />'
        
        return f'''<div class="notion-callout notion-{color}">
            {icon_html}
            <div class="notion-callout-content">{content}</div>
        </div>'''
    
    def _render_divider(self, block: Dict[str, Any]) -> str:
        """divider 블록 렌더링"""
        return '<hr class="notion-hr" />'
    
    def _render_image(self, block: Dict[str, Any]) -> str:
        """image 블록 렌더링"""
        data = block.get('image', {})
        caption = self._render_rich_text(data.get('caption', []))
        
        # 이미지 URL 가져오기
        if data.get('type') == 'external':
            url = data.get('external', {}).get('url', '')
        elif data.get('type') == 'file':
            url = data.get('file', {}).get('url', '')
        else:
            url = ''
        
        if not url:
            return '<!-- Empty image block -->'
        
        result = f'''<figure class="notion-image">
            <img src="{html.escape(url)}" alt="{html.escape(caption)}" loading="lazy" />'''
        if caption:
            result += f'\n<figcaption class="notion-caption">{caption}</figcaption>'
        result += '\n</figure>'
        return result
    
    def _render_video(self, block: Dict[str, Any]) -> str:
        """video 블록 렌더링"""
        data = block.get('video', {})
        caption = self._render_rich_text(data.get('caption', []))
        
        if data.get('type') == 'external':
            url = data.get('external', {}).get('url', '')
            # YouTube 임베드 처리
            if 'youtube.com' in url or 'youtu.be' in url:
                video_id = self._extract_youtube_id(url)
                if video_id:
                    result = f'''<figure class="notion-video">
                        <iframe src="https://www.youtube.com/embed/{video_id}" 
                                frameborder="0" allowfullscreen
                                class="notion-youtube-embed"></iframe>'''
                    if caption:
                        result += f'\n<figcaption class="notion-caption">{caption}</figcaption>'
                    result += '\n</figure>'
                    return result
            return f'<a href="{html.escape(url)}" target="_blank" rel="noopener noreferrer">{url}</a>'
        elif data.get('type') == 'file':
            url = data.get('file', {}).get('url', '')
            result = f'''<figure class="notion-video">
                <video src="{html.escape(url)}" controls></video>'''
            if caption:
                result += f'\n<figcaption class="notion-caption">{caption}</figcaption>'
            result += '\n</figure>'
            return result
        return '<!-- Empty video block -->'
    
    def _extract_youtube_id(self, url: str) -> Optional[str]:
        """YouTube URL에서 비디오 ID 추출"""
        import re
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com/embed/([a-zA-Z0-9_-]{11})',
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def _render_file(self, block: Dict[str, Any]) -> str:
        """file 블록 렌더링"""
        data = block.get('file', {})
        caption = self._render_rich_text(data.get('caption', []))
        
        if data.get('type') == 'external':
            url = data.get('external', {}).get('url', '')
        elif data.get('type') == 'file':
            url = data.get('file', {}).get('url', '')
        else:
            url = ''
        
        name = data.get('name', 'Download file')
        return f'''<div class="notion-file">
            <a href="{html.escape(url)}" target="_blank" rel="noopener noreferrer" download>
                📎 {html.escape(name)}
            </a>
        </div>'''
    
    def _render_pdf(self, block: Dict[str, Any]) -> str:
        """pdf 블록 렌더링"""
        data = block.get('pdf', {})
        
        if data.get('type') == 'external':
            url = data.get('external', {}).get('url', '')
        elif data.get('type') == 'file':
            url = data.get('file', {}).get('url', '')
        else:
            url = ''
        
        return f'''<div class="notion-pdf">
            <embed src="{html.escape(url)}" type="application/pdf" width="100%" height="600px" />
        </div>'''
    
    def _render_bookmark(self, block: Dict[str, Any]) -> str:
        """bookmark 블록 렌더링"""
        data = block.get('bookmark', {})
        url = data.get('url', '')
        caption = self._render_rich_text(data.get('caption', []))
        
        return f'''<div class="notion-bookmark">
            <a href="{html.escape(url)}" target="_blank" rel="noopener noreferrer">
                <span class="notion-bookmark-url">{html.escape(url)}</span>
            </a>
            {f'<p class="notion-caption">{caption}</p>' if caption else ''}
        </div>'''
    
    def _render_embed(self, block: Dict[str, Any]) -> str:
        """embed 블록 렌더링"""
        data = block.get('embed', {})
        url = data.get('url', '')
        caption = self._render_rich_text(data.get('caption', []))
        
        result = f'''<div class="notion-embed">
            <iframe src="{html.escape(url)}" frameborder="0" allowfullscreen></iframe>'''
        if caption:
            result += f'\n<figcaption class="notion-caption">{caption}</figcaption>'
        result += '\n</div>'
        return result
    
    def _render_equation(self, block: Dict[str, Any]) -> str:
        """equation 블록 렌더링 (KaTeX)"""
        data = block.get('equation', {})
        expression = data.get('expression', '')
        return f'<div class="notion-equation" data-equation="{html.escape(expression)}">$${html.escape(expression)}$$</div>'
    
    def _render_table(self, block: Dict[str, Any]) -> str:
        """table 블록 렌더링"""
        data = block.get('table', {})
        has_column_header = data.get('has_column_header', False)
        has_row_header = data.get('has_row_header', False)
        
        return f'''<table class="notion-table" data-has-column-header="{str(has_column_header).lower()}" data-has-row-header="{str(has_row_header).lower()}">
            <tbody>
            <!-- Table rows will be rendered as children -->
            </tbody>
        </table>'''
    
    def _render_table_row(self, block: Dict[str, Any]) -> str:
        """table_row 블록 렌더링"""
        data = block.get('table_row', {})
        cells = data.get('cells', [])
        
        cells_html = ''
        for cell in cells:
            content = self._render_rich_text(cell)
            cells_html += f'<td class="notion-table-cell">{content}</td>'
        
        return f'<tr class="notion-table-row">{cells_html}</tr>'
    
    def _render_column_list(self, block: Dict[str, Any]) -> str:
        """column_list 블록 렌더링"""
        return '<div class="notion-column-list"><!-- Columns will be rendered as children --></div>'
    
    def _render_column(self, block: Dict[str, Any]) -> str:
        """column 블록 렌더링"""
        return '<div class="notion-column"><!-- Column content will be rendered as children --></div>'
    
    def _render_synced_block(self, block: Dict[str, Any]) -> str:
        """synced_block 블록 렌더링"""
        return '<div class="notion-synced-block"><!-- Synced content --></div>'
    
    def _render_template(self, block: Dict[str, Any]) -> str:
        """template 블록 렌더링"""
        data = block.get('template', {})
        content = self._render_rich_text(data.get('rich_text', []))
        return f'<div class="notion-template">{content}</div>'
    
    def _render_link_to_page(self, block: Dict[str, Any]) -> str:
        """link_to_page 블록 렌더링"""
        data = block.get('link_to_page', {})
        page_id = data.get('page_id', '')
        return f'<div class="notion-link-to-page"><a href="/{page_id}">📄 Linked Page</a></div>'
    
    def _render_table_of_contents(self, block: Dict[str, Any]) -> str:
        """table_of_contents 블록 렌더링"""
        return '<div class="notion-table-of-contents"><!-- TOC will be generated dynamically --></div>'
    
    def _render_breadcrumb(self, block: Dict[str, Any]) -> str:
        """breadcrumb 블록 렌더링"""
        return '<div class="notion-breadcrumb"><!-- Breadcrumb --></div>'
    
    def _render_child_page(self, block: Dict[str, Any]) -> str:
        """child_page 블록 렌더링"""
        data = block.get('child_page', {})
        title = data.get('title', 'Untitled')
        block_id = block.get('id', '')
        return f'<div class="notion-child-page"><a href="/{block_id}">📄 {html.escape(title)}</a></div>'
    
    def _render_child_database(self, block: Dict[str, Any]) -> str:
        """child_database 블록 렌더링"""
        data = block.get('child_database', {})
        title = data.get('title', 'Untitled Database')
        return f'<div class="notion-child-database">📊 {html.escape(title)}</div>'


def render_notion_blocks(blocks: List[Dict[str, Any]]) -> str:
    """
    Notion 블록 리스트를 HTML로 렌더링하는 헬퍼 함수
    
    Args:
        blocks: Notion API에서 가져온 블록 리스트
        
    Returns:
        렌더링된 HTML 문자열
    """
    renderer = NotionBlockRenderer(blocks)
    return renderer.render()
