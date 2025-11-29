# blog/urls.py
from django.urls import path

from blog.views import (
    index,
    feed,
    post,
    api_posts,
    api_post_detail,
    api_tags,
    api_categories,
    api_revalidate,
)


urlpatterns = [
    # Pages
    path('', index, name='index'),
    path('archive', feed, name='archive'),
    path('<slug:slug>', post, name='post_detail'),
    
    # API
    path('api/posts/', api_posts, name='api_posts'),
    path('api/posts/<slug:slug>/', api_post_detail, name='api_post_detail'),
    path('api/tags/', api_tags, name='api_tags'),
    path('api/categories/', api_categories, name='api_categories'),
    path('api/revalidate/', api_revalidate, name='api_revalidate'),
]