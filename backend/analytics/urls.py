from django.urls import path
from .views import TrackPageViewView, TrackBlogReadView, SessionHeartbeatView

urlpatterns = [
    path('pageview/', TrackPageViewView.as_view(), name='track-pageview'),
    path('blog-read/', TrackBlogReadView.as_view(), name='track-blog-read'),
    path('heartbeat/', SessionHeartbeatView.as_view(), name='session-heartbeat'),
]
