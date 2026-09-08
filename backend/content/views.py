from rest_framework import generics
from .models import Project, Skill, BlogPost, Link, Tag
from .serializers import ProjectSerializer, SkillSerializer, BlogPostSerializer, LinkSerializer

class ProjectListView(generics.ListAPIView):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

class ProjectDetailView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'slug'

class SkillListView(generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class BlogListView(generics.ListAPIView):
    serializer_class = BlogPostSerializer

    def get_queryset(self):
        queryset = BlogPost.objects.filter(is_draft=False).order_by('-published_at')
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        return queryset

class BlogDetailView(generics.RetrieveAPIView):
    queryset = BlogPost.objects.filter(is_draft=False)
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'

class LinkListView(generics.ListAPIView):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer
