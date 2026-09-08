import uuid
from django.db import models

class SkillCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Skill Categories"

class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    proficiency_level = models.CharField(max_length=50)
    icon_url = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.proficiency_level})"

    class Meta:
        unique_together = ('name', 'category')

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    content = models.TextField(blank=True, null=True)
    thumbnail_url = models.TextField(blank=True, null=True)
    stack = models.JSONField(default=list, blank=True)
    github_url = models.TextField(blank=True, null=True)
    live_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class BlogPost(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    content = models.TextField()
    cover_image_url = models.TextField(blank=True, null=True)
    published_at = models.DateTimeField(auto_now_add=True)
    is_draft = models.BooleanField(default=True)
    tags = models.ManyToManyField(Tag, related_name='blog_posts')

    def __str__(self):
        return self.title

class Link(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    platform = models.CharField(max_length=50)
    url = models.TextField()
    icon_class = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.platform}: {self.url}"
