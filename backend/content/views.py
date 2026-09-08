from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from django.db import transaction
from .models import Project, Skill, Blog, BlogSection, BlogCell, BlogCellOutput, Link, Tag
from .serializers import ProjectSerializer, SkillSerializer, BlogSerializer, BlogSectionSerializer, BlogCellSerializer, LinkSerializer, TagSerializer
from .permissions import IsAdminOrReadOnly

class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'slug'
    permission_classes = [IsAdminOrReadOnly]

class SkillListCreateView(generics.ListCreateAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminOrReadOnly]

class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminOrReadOnly]

class BlogListCreateView(generics.ListCreateAPIView):
    serializer_class = BlogSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Blog.objects.filter(is_draft=False).order_by('-published_at')
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        return queryset

class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    lookup_field = 'slug'
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_superuser:
            return Blog.objects.all()
        return Blog.objects.filter(is_draft=False)

class BlogSyncView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def post(self, request, blog_id):
        blog = generics.get_object_or_404(Blog, id=blog_id)
        sections_data = request.data.get('sections', [])

        with transaction.atomic():
            # Mirror sync: clear and recreate to ensure ordering and deletions are exact
            BlogSection.objects.filter(blog=blog).delete()

            for s_idx, s_data in enumerate(sections_data):
                section = BlogSection.objects.create(
                    blog=blog,
                    title=s_data.get('title', 'Untitled Section'),
                    order=s_idx
                )

                cells_data = s_data.get('cells', [])
                for c_idx, c_data in enumerate(cells_data):
                    cell = BlogCell.objects.create(
                        section=section,
                        cell_type=c_data.get('cell_type', 'markdown'),
                        content=c_data.get('content', ''),
                        language=c_data.get('language', 'python'),
                        order=c_idx
                    )

                    # Handle output persistence
                    output_data = c_data.get('output')
                    if output_data:
                        BlogCellOutput.objects.create(
                            cell=cell,
                            text_output=output_data.get('text_output'),
                            error_output=output_data.get('error_output'),
                            image_output=output_data.get('image_output'),
                        )

        return Response({'status': 'Blog structure synchronized'}, status=status.HTTP_200_OK)

class BlogSectionReorderView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def patch(self, request, slug):
        blog = generics.get_object_or_404(Blog, slug=slug)
        ordered_ids = request.data.get('order', [])

        with transaction.atomic():
            for index, section_id in enumerate(ordered_ids):
                BlogSection.objects.filter(id=section_id, blog=blog).update(order=index)

        return Response({'status': 'sections reordered'}, status=status.HTTP_200_OK)

class BlogCellReorderView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def patch(self, request, section_id):
        section = generics.get_object_or_404(BlogSection, id=section_id)
        ordered_ids = request.data.get('order', [])

        with transaction.atomic():
            for index, cell_id in enumerate(ordered_ids):
                BlogCell.objects.filter(id=cell_id, section=section).update(order=index)

        return Response({'status': 'cells reordered'}, status=status.HTTP_200_OK)

class BlogSectionListCreateView(generics.ListCreateAPIView):
    serializer_class = BlogSectionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return BlogSection.objects.all()

class BlogSectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BlogSection.objects.all()
    serializer_class = BlogSectionSerializer
    permission_classes = [IsAdminOrReadOnly]

class BlogCellListCreateView(generics.ListCreateAPIView):
    serializer_class = BlogCellSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return BlogCell.objects.all()

class BlogCellDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BlogCell.objects.all()
    serializer_class = BlogCellSerializer
    permission_classes = [IsAdminOrReadOnly]

class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]

class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]

class LinkListCreateView(generics.ListCreateAPIView):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer
    permission_classes = [IsAdminOrReadOnly]

class LinkDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer
    permission_classes = [IsAdminOrReadOnly]
