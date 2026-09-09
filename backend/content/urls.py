from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailView,
    SkillListCreateView, SkillDetailView,
    BlogListCreateView, BlogDetailView,
    BlogSectionListCreateView, BlogSectionDetailView,
    BlogCellListCreateView, BlogCellDetailView,
    BlogSectionReorderView, BlogCellReorderView,
    BlogSyncView,
    TagListCreateView, TagDetailView,
    LinkListCreateView, LinkDetailView,
    NotebookListCreateView, NotebookDetailView, NotebookReorderView
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
    path('blogs/<uuid:blog_id>/sync/', BlogSyncView.as_view(), name='blog-sync'),
    path('blogs/<slug:slug>/sections/reorder/', BlogSectionReorderView.as_view(), name='blog-sections-reorder'),
    path('blog-sections/', BlogSectionListCreateView.as_view(), name='blog-section-list'),
    path('blog-sections/<uuid:pk>/', BlogSectionDetailView.as_view(), name='blog-section-detail'),
    path('blog-sections/<uuid:section_id>/notebooks/', NotebookListCreateView.as_view(), name='notebook-list'),
    path('blog-sections/<uuid:section_id>/notebooks/<uuid:pk>/', NotebookDetailView.as_view(), name='notebook-detail'),
    path('blog-sections/<uuid:section_id>/notebooks/reorder/', NotebookReorderView.as_view(), name='notebook-reorder'),
    path('blog-sections/<uuid:pk>/cells/reorder/', BlogCellReorderView.as_view(), name='blog-cells-reorder'),
    path('blog-cells/', BlogCellListCreateView.as_view(), name='blog-cell-list'),
    path('blog-cells/<uuid:pk>/', BlogCellDetailView.as_view(), name='blog-cell-detail'),
    path('tags/', TagListCreateView.as_view(), name='tag-list'),
    path('tags/<uuid:pk>/', TagDetailView.as_view(), name='tag-detail'),
    path('links/', LinkListCreateView.as_view(), name='link-list'),
    path('links/<uuid:pk>/', LinkDetailView.as_view(), name='link-detail'),
]
