from django.urls import path
from .views import (
    TrackPageViewView, TrackBlogReadView, SessionHeartbeatView,
    AnalyticsOverviewView, VisitorsOverTimeView, MostReadBlogsView,
    PageViewCountsView, ActiveSessionsView
)

urlpatterns = [
    # Tracking endpoints (Public)
    path('pageview/', TrackPageViewView.as_view(), name='track-pageview'),
    path('blog-read/', TrackBlogReadView.as_view(), name='track-blog-read'),
    path('heartbeat/', SessionHeartbeatView.as_view(), name='session-heartbeat'),

    # Aggregation endpoints (Admin Only)
    path('overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
    path('visitors-over-time/', VisitorsOverTimeView.as_view(), name='visitors-over-time'),
    path('most-read-blogs/', MostReadBlogsView.as_view(), name='most-read-blogs'),
    path('page-counts/', PageViewCountsView.as_view(), name='page-counts'),
    path('active-sessions/', ActiveSessionsView.as_view(), name='active-sessions'),
]
