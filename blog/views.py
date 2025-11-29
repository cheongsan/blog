# blog/views.py
from datetime import datetime
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, Http404, JsonResponse
from django.conf import settings
from django.views.decorators.cache import cache_page

from .utils import get_gravatar_url
from api.notion import NotionService, get_notion_service, get_text_content


def index(request):
    """Home page view"""
    # Gravatar URL 조회 (고화질 512px)
    gravatar_username = settings.SITE_PROFILE.get('gravatar')
    gravatar_url = get_gravatar_url(gravatar_username, 512) if gravatar_username else None
    
    # Notion에서 포스트 가져오기
    notion = get_notion_service()
    
    # Get pinned posts
    pinned_posts = notion.get_pinned_posts()
    
    # Get recent posts (limit to 10)
    public_posts = notion.get_public_posts()
    recent_posts = public_posts[:10]
    
    # Get tags
    tags_dict = notion.get_all_tags(public_posts)
    tags = [{'name': name, 'count': count} for name, count in tags_dict.items()]
    tags.sort(key=lambda x: x['count'], reverse=True)
    
    context = {
        'now': datetime.now(),
        'pinned_posts': pinned_posts,
        'recent_posts': recent_posts,
        'gravatar_url': gravatar_url,
        'tags': tags,
    }
    return render(request, 'home.html', context)


def home(request):
    """Home page view (alias for index)"""
    return index(request)

def feed(request):
    """
    아카이브 페이지 - 모든 공개 포스트 목록
    Next.js의 archive.tsx와 동일한 기능
    accept_status = ["Public", "Pinned", "Archived"] 인 글을 가져옴
    """
    notion = get_notion_service()
    
    # 디버그 정보 수집
    debug_info = {
        'page_id': notion.page_id,
        'page_id_length': len(notion.page_id) if notion.page_id else 0,
        'api_type': '공식 API (Official)',
    }
    
    # 검색어 및 필터 파라미터
    q = request.GET.get('q', '').strip()
    tag = request.GET.get('tag', '').strip()
    category = request.GET.get('category', '').strip()
    order = request.GET.get('order', 'desc').strip()
    tab = request.GET.get('tab', 'tag').strip()
    
    # 원본 포스트 가져오기 (필터링 전)
    try:
        raw_posts = notion.get_posts(use_cache=False)
        debug_info['raw_posts_count'] = len(raw_posts)
        debug_info['raw_posts_sample'] = raw_posts[:2] if raw_posts else []
        debug_info['error'] = None
    except Exception as e:
        import traceback
        raw_posts = []
        debug_info['raw_posts_count'] = 0
        debug_info['error'] = str(e)
        debug_info['traceback'] = traceback.format_exc()
    
    # 모든 공개 포스트 가져오기 (Public, Pinned, Archived)
    all_posts = notion.get_all_posts()
    debug_info['filtered_posts_count'] = len(all_posts)
    
    # 필터링된 포스트 샘플
    if all_posts:
        debug_info['filtered_posts_sample'] = [
            {
                'id': p.get('id'),
                'title': p.get('title'),
                'slug': p.get('slug'),
                'status': p.get('status'),
                'type': p.get('type'),
            }
            for p in all_posts[:3]
        ]
    else:
        debug_info['filtered_posts_sample'] = []
    
    # 필터링
    posts = all_posts
    if tag:
        posts = [p for p in posts if tag in (p.get('tags') or [])]
    if category:
        posts = [p for p in posts if category in (p.get('category') or [])]
    if q:
        q_lower = q.lower()
        posts = [
            p for p in posts
            if q_lower in (p.get('title') or '').lower()
            or q_lower in (p.get('summary') or '').lower()
            or any(q_lower in t.lower() for t in (p.get('tags') or []))
        ]
    
    # 정렬 (기본은 최신순 desc)
    reverse_sort = True
    if order == 'asc':
        reverse_sort = False
        
    # 날짜 기준 정렬
    posts.sort(key=lambda x: x.get('date', {}).get('start_date') or x.get('createdTime') or '', reverse=reverse_sort)
    
    # 태그 목록 (전체 포스트 기준)
    tags_dict = notion.get_all_tags(all_posts)
    tags = [{'name': name, 'count': count} for name, count in tags_dict.items()]
    tags.sort(key=lambda x: x['count'], reverse=True)
    
    # 카테고리 목록
    categories_dict = notion.get_all_categories(all_posts)
    categories = [{'name': name, 'count': count} for name, count in categories_dict.items()]
    categories.sort(key=lambda x: x['count'], reverse=True)
    
    # 년도별 그룹화
    posts_by_year = {}
    for post in posts:
        date_info = post.get('date', {})
        if date_info and date_info.get('start_date'):
            year = date_info['start_date'][:4]
        else:
            created = post.get('createdTime', '')
            year = created[:4] if created else 'Unknown'
        
        if year not in posts_by_year:
            posts_by_year[year] = []
        posts_by_year[year].append(post)
    
    # 년도 정렬 (항상 최신 년도가 위로 오도록)
    sorted_posts_by_year = dict(sorted(posts_by_year.items(), reverse=True))
    
    # 만약 오름차순(asc)이면 년도 내의 포스트 순서는 이미 위에서 정렬되었지만,
    # 년도 자체의 순서는 어떻게 할지 결정해야 함. 보통 아카이브는 년도는 내림차순 유지하고 내부만 바꿀 수도 있고
    # 전체를 뒤집을 수도 있음. 여기서는 전체 리스트 정렬 후 그룹화했으므로
    # 그룹화 로직에 따라 순서가 결정됨.
    # 하지만 dict 순서는 삽입 순서이므로, 위에서 posts를 정렬하고 순서대로 넣으면 됨.
    # 다만 posts_by_year를 다시 정렬하면 섞일 수 있음.
    
    # 개선된 그룹화 로직: 정렬된 posts를 순회하며 그룹화하면 순서 유지됨
    posts_by_year = {}
    for post in posts:
        date_info = post.get('date', {})
        if date_info and date_info.get('start_date'):
            year = date_info['start_date'][:4]
        else:
            created = post.get('createdTime', '')
            year = created[:4] if created else 'Unknown'
        
        if year not in posts_by_year:
            posts_by_year[year] = []
        posts_by_year[year].append(post)
        
    context = {
        'posts': posts,
        'posts_by_year': posts_by_year,
        'total_count': len(posts),
        'tags': tags,
        'categories': categories,
        'current_tag': tag,
        'current_category': category,
        'current_order': order,
        'current_tab': tab,
        'search_query': q,
        'debug_info': debug_info,
    }
    
    # HTMX 요청인 경우 부분 템플릿만 렌더링
    if request.headers.get('HX-Request'):
        return render(request, 'components/feed_content.html', context)
        
    return render(request, 'feed.html', context)


def post(request, slug):
    """포스트 상세 페이지"""
    notion = get_notion_service()
    
    # 슬러그로 포스트 찾기
    post = notion.get_post_by_slug(slug)
    
    if not post:
        raise Http404("포스트를 찾을 수 없습니다.")
    
    # 상세 정보 (RecordMap 포함) 가져오기
    post_detail = notion.get_post_detail(post['id'])
    
    if not post_detail:
        raise Http404("포스트 내용을 불러올 수 없습니다.")
    
    context = {
        'post': post_detail,
    }
    return render(request, 'post.html', context)

# === API Views ===

def api_posts(request):
    """포스트 목록 API"""
    notion = get_notion_service()
    posts = notion.get_public_posts()
    
    # 필요한 필드만 반환
    result = []
    for post in posts:
        result.append({
            'id': post.get('id'),
            'title': post.get('title'),
            'slug': post.get('slug'),
            'summary': post.get('summary'),
            'date': post.get('date'),
            'tags': post.get('tags', []),
            'category': post.get('category', []),
            'thumbnail': post.get('thumbnail'),
        })
    
    return JsonResponse({'posts': result})


def api_post_detail(request, slug):
    """포스트 상세 API"""
    notion = get_notion_service()
    post = notion.get_post_by_slug(slug)
    
    if not post:
        return JsonResponse({'error': '포스트를 찾을 수 없습니다.'}, status=404)
    
    return JsonResponse({'post': post})


def api_tags(request):
    """태그 목록 API"""
    notion = get_notion_service()
    tags = notion.get_all_tags()
    return JsonResponse({'tags': tags})


def api_categories(request):
    """카테고리 목록 API"""
    notion = get_notion_service()
    categories = notion.get_all_categories()
    return JsonResponse({'categories': categories})


def api_revalidate(request):
    """캐시 무효화 API"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST 메소드만 허용됩니다.'}, status=405)
    
    notion = get_notion_service()
    notion.clear_cache()
    
    return JsonResponse({'revalidated': True})