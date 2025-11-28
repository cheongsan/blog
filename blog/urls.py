# blog/urls.py
from django.urls import path

from blog.views import (
    index,
    post_list,
    post_detail,
    archive,
    api_posts,
    api_post_detail,
    api_tags,
    api_categories,
    api_revalidate,
)


urlpatterns = [
    # Pages
    path('', index, name='index'),
    path('posts/', post_list, name='post_list'),
    path('posts/<slug:slug>/', post_detail, name='post_detail'),
    path('archive/', archive, name='archive'),
    
    # API
    path('api/posts/', api_posts, name='api_posts'),
    path('api/posts/<slug:slug>/', api_post_detail, name='api_post_detail'),
    path('api/tags/', api_tags, name='api_tags'),
    path('api/categories/', api_categories, name='api_categories'),
    path('api/revalidate/', api_revalidate, name='api_revalidate'),
]