from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from django.db import transaction
import json
import uuid
from .models import Project, Skill, Blog, BlogSection, BlogCell, BlogCellOutput, Notebook, Link, Tag
from .serializers import ProjectSerializer, SkillSerializer, BlogSerializer, BlogSectionSerializer, BlogCellSerializer, NotebookSerializer, LinkSerializer, TagSerializer
from .permissions import IsAdminOrReadOnly
from .utils import upload_file_to_supabase, delete_file_from_supabase

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
    queryset = Skill.objects.all().select_related('category')
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
        queryset = Blog.objects.filter(is_draft=False).order_by('-published_at').prefetch_related(
            'tags',
            'sections__cells__output',
            'sections__notebooks',
        )
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        return queryset

class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    lookup_field = 'slug'
    permission_classes = [IsAdminOrReadOnly]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_cover_url = instance.cover_image_url

        # Check if cover_image_url is being updated
        new_cover_url = request.data.get('cover_image_url')

        response = super().update(request, *args, **kwargs)

        if new_cover_url and old_cover_url and new_cover_url != old_cover_url:
            from .utils import extract_path_from_url
            old_path = extract_path_from_url(old_cover_url)
            if old_path:
                try:
                    delete_file_from_supabase(old_path)
                except Exception as e:
                    # Log warning instead of raising to avoid blocking the update
                    print(f"Warning: Failed to delete old cover image {old_path}: {e}")

        return response

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
            # Identify IDs to keep to avoid deleting notebooks/cells
            requested_ids = [s.get('id') for s in sections_data if s.get('id')]
            BlogSection.objects.filter(blog=blog).exclude(id__in=requested_ids).delete()

            for s_idx, s_data in enumerate(sections_data):
                s_id = s_data.get('id')
                section = None

                if s_id:
                    section = BlogSection.objects.filter(blog=blog, id=s_id).first()

                if section:
                    section.title = s_data.get('title', section.title)
                    section.order = s_idx
                    section.save()
                else:
                    section = BlogSection.objects.create(
                        id=s_id if s_id else uuid.uuid4(),
                        blog=blog,
                        title=s_data.get('title', 'Untitled Section'),
                        order=s_idx
                    )

                cells_data = s_data.get('cells', [])
                # Note: For a full mirror sync of cells, we would need a similar ID-based update.
                # Since cells aren't currently synced from BlogManager, we'll keep this simple.
                for c_idx, c_data in enumerate(cells_data):
                    cell = BlogCell.objects.create(
                        section=section,
                        cell_type=c_data.get('cell_type', 'markdown'),
                        content=c_data.get('content', ''),
                        language=c_data.get('language', 'python'),
                        order=c_idx
                    )

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

class NotebookListCreateView(generics.ListCreateAPIView):
    serializer_class = NotebookSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        section_id = self.kwargs.get('section_id')
        return Notebook.objects.filter(section_id=section_id).order_by('order')

    def perform_create(self, serializer):
        section = generics.get_object_or_404(BlogSection, id=self.kwargs.get('section_id'))
        blog = section.blog

        file_obj = self.request.FILES.get('file')
        if not file_obj:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'file': 'No notebook file provided'})

        try:
            content = json.loads(file_obj.read().decode('utf-8'))
            file_obj.seek(0)
            if 'cells' not in content or not isinstance(content['cells'], list):
                raise ValueError("Invalid Jupyter notebook structure")
        except (json.JSONDecodeError, ValueError) as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'file': str(e)})

        title = self.request.data.get('title')
        if not title:
            title = file_obj.name.replace('.ipynb', '').replace('_', ' ').title()

        notebook = serializer.save(section=section, title=title)

        custom_path = f"blogs/{blog.id}/notebooks/{notebook.id}.ipynb"
        public_url, stored_path = upload_file_to_supabase(file_obj, custom_path=custom_path)

        notebook.storage_path = stored_path
        notebook.save()

        from .utils import parse_notebook_and_save_cells, get_supabase_client
        parse_notebook_and_save_cells(notebook, content, get_supabase_client())

class NotebookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notebook.objects.all()
    serializer_class = NotebookSerializer
    permission_classes = [IsAdminOrReadOnly]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        file_obj = request.FILES.get('file')
        if file_obj:
            try:
                content = json.loads(file_obj.read().decode('utf-8'))
                file_obj.seek(0)
                if 'cells' not in content or not isinstance(content['cells'], list):
                    return Response({'error': 'Invalid Jupyter notebook structure'}, status=status.HTTP_400_BAD_REQUEST)

                blog = instance.section.blog
                custom_path = f"blogs/{blog.id}/notebooks/{instance.id}.ipynb"

                delete_file_from_supabase(instance.storage_path)

                public_url, stored_path = upload_file_to_supabase(file_obj, custom_path=custom_path)
                instance.storage_path = stored_path
                instance.save()

                from .utils import parse_notebook_and_save_cells, get_supabase_client
                parse_notebook_and_save_cells(instance, content, get_supabase_client())
            except (json.JSONDecodeError, ValueError) as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return super().update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        delete_file_from_supabase(instance.storage_path)
        instance.delete()

class NotebookReorderView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def patch(self, request, section_id):
        section = generics.get_object_or_404(BlogSection, id=section_id)
        ordered_ids = request.data.get('order', [])

        with transaction.atomic():
            for index, notebook_id in enumerate(ordered_ids):
                Notebook.objects.filter(id=notebook_id, section=section).update(order=index)

        return Response({'status': 'notebooks reordered'}, status=status.HTTP_200_OK)
