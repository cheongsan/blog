# blog/urls.py
from django.urls import path

from blog.views import index, post_list, post_detail


urlpatterns = [
    path('', index, name='index'),
    path('posts/', post_list, name='post_list'),
    path('posts/<int:post_id>/', post_detail, name='post_detail'),
]