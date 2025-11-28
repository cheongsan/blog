# blog/views.py
from datetime import datetime
from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from .utils import get_gravatar_url

def index(request):
    """Home page view"""
    # Gravatar URL 조회 (고화질 512px)
    gravatar_username = settings.SITE_PROFILE.get('gravatar')
    gravatar_url = get_gravatar_url(gravatar_username, 512) if gravatar_username else None
    
    # Get pinned posts
    pinned_posts = []  # TODO: Fetch from Notion API or database
    
    # Get recent posts (limit to 10)
    recent_posts = []  # TODO: Fetch from Notion API or database
    
    context = {
        'now': datetime.now(),
        'pinned_posts': pinned_posts,
        'recent_posts': recent_posts,
        'gravatar_url': gravatar_url,
    }
    return render(request, 'blog/home.html', context)

def home(request):
    """Home page view"""
    # Gravatar URL 조회 (고화질 512px)
    gravatar_username = settings.SITE_PROFILE.get('gravatar')
    gravatar_url = get_gravatar_url(gravatar_username, 512) if gravatar_username else None
    
    # Get pinned posts
    pinned_posts = []  # TODO: Fetch from Notion API or database
    
    # Get recent posts (limit to 10)
    recent_posts = []  # TODO: Fetch from Notion API or database
    
    # Get tags
    tags = [
        {'name': 'Python', 'count': 10},
        {'name': 'Django', 'count': 5},
        {'name': 'React', 'count': 3},
        {'name': 'Next.js', 'count': 2},
    ]

    context = {
        'pinned_posts': pinned_posts,
        'recent_posts': recent_posts,
        'gravatar_url': gravatar_url,
        'tags': tags,
    }
    return render(request, 'blog/home.html', context)

def post_list(request):
    posts = []
    context = {
        'posts': posts,
    }
    return render(request, 'blog/post_list.html', context)

def post_detail(request, post_id):
    post = {
        'id': post_id,
        'title': '샘플 포스트',
        'content': '<p>이것은 샘플 포스트입니다.</p>',
        'created_at': datetime.now(),
    }
    context = {
        'post': post,
    }
    return render(request, 'blog/post_detail.html', context)