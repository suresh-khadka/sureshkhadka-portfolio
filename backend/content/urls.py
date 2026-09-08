from django.urls import path
from .views import (
    ProjectListView, ProjectDetailView,
    SkillListView,
    BlogListView, BlogDetailView,
    LinkListView
)

urlpatterns = [
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/<slug:slug>/', ProjectDetailView.as_view(), name='project-detail'),
    path('skills/', SkillListView.as_view(), name='skill-list'),
    path('blogs/', BlogListView.as_view(), name='blog-list'),
    path('blogs/<slug:slug>/', BlogDetailView.as_view(), name='blog-detail'),
    path('links/', LinkListView.as_view(), name='link-list'),
]
