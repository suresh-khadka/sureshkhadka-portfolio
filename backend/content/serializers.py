from rest_framework import serializers
from .models import SkillCategory, Skill, Project, Tag, BlogPost, Link

class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'category_name', 'proficiency_level', 'icon_url']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'slug', 'description', 'content', 'thumbnail_url', 'stack', 'github_url', 'live_url', 'created_at']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class BlogPostSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'content', 'cover_image_url', 'published_at', 'tags']

class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = ['id', 'platform', 'url', 'icon_class']
