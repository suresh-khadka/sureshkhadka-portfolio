from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailView,
    SkillListCreateView, SkillDetailView,
    BlogListCreateView, BlogDetailView,
    TagListCreateView, TagDetailView,
    LinkListCreateView, LinkDetailView
)
from .upload_views import FileUploadView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('projects/', ProjectListCreateView.as_view(), name='project-list'),
    path('projects/<slug:slug>/', ProjectDetailView.as_view(), name='project-detail'),
    path('skills/', SkillListCreateView.as_view(), name='skill-list'),
    path('skills/<uuid:pk>/', SkillDetailView.as_view(), name='skill-detail'),
    path('blogs/', BlogListCreateView.as_view(), name='blog-list'),
    path('blogs/<slug:slug>/', BlogDetailView.as_view(), name='blog-detail'),
    path('tags/', TagListCreateView.as_view(), name='tag-list'),
    path('tags/<uuid:pk>/', TagDetailView.as_view(), name='tag-detail'),
    path('links/', LinkListCreateView.as_view(), name='link-list'),
    path('links/<uuid:pk>/', LinkDetailView.as_view(), name='link-detail'),
]
