# blog/urls.py
from django.urls import path

from blog.views import (
    index,
    feed,
    detail
)


urlpatterns = [
    # Pages
    path('', index, name='index'),
    path('archive', feed, name='archive'),
    path('<slug:slug>', detail, name='detail')
]