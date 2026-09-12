from rest_framework import serializers
from .models import SkillCategory, Skill, Project, Tag, Blog, BlogSection, BlogCell, BlogCellOutput, Notebook, Link

class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'category_name', 'proficiency_level', 'proficiency', 'icon_url']

# FLAG: 'content' field is potentially very large.
# Consider splitting into a lightweight list serializer and a detail serializer.
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'slug', 'description', 'content', 'thumbnail_url', 'stack', 'github_url', 'live_url', 'created_at']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class BlogCellOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCellOutput
        fields = ['text_output', 'error_output', 'image_output']

class NotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notebook
        fields = ['id', 'section', 'title', 'storage_path', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'section', 'storage_path', 'order', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make title optional during validation so perform_create can derive it
        if 'title' in self.fields:
            self.fields['title'].required = False

class BlogCellSerializer(serializers.ModelSerializer):
    output = BlogCellOutputSerializer(read_only=True)

    class Meta:
        model = BlogCell
        fields = ['id', 'cell_type', 'content', 'language', 'order', 'output']

class BlogSectionSerializer(serializers.ModelSerializer):
    cells = BlogCellSerializer(many=True, read_only=True)
    notebooks = NotebookSerializer(many=True, read_only=True)

    class Meta:
        model = BlogSection
        fields = ['id', 'title', 'slug', 'order', 'cells', 'notebooks']

class BlogSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    sections = BlogSectionSerializer(many=True, read_only=True)

    class Meta:
        model = Blog
        fields = ['id', 'title', 'slug', 'intro', 'cover_image_url', 'published_at', 'is_draft', 'tags', 'sections']

class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = ['id', 'platform', 'url', 'icon_class']
