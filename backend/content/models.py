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
    proficiency = models.IntegerField(default=0)
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

class Blog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    intro = models.TextField(blank=True, null=True)
    cover_image_url = models.TextField(blank=True, null=True)
    published_at = models.DateTimeField(auto_now_add=True)
    is_draft = models.BooleanField(default=True)
    tags = models.ManyToManyField(Tag, related_name='blogs')

    def __str__(self):
        return self.title

class BlogSection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True, null=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ('blog', 'slug')

    def __str__(self):
        return f"{self.blog.title} - {self.title}"

class Notebook(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(BlogSection, on_delete=models.CASCADE, related_name='notebooks')
    title = models.CharField(max_length=255)
    storage_path = models.TextField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.title} - {self.title}"

class BlogCell(models.Model):
    CELL_TYPES = (
        ('markdown', 'Markdown'),
        ('code', 'Code'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(BlogSection, on_delete=models.CASCADE, related_name='cells')
    cell_type = models.CharField(max_length=10, choices=CELL_TYPES, default='markdown')
    content = models.TextField()
    language = models.CharField(max_length=20, default='python')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.title} - {self.cell_type} {self.id}"

class BlogCellOutput(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cell = models.OneToOneField(BlogCell, on_delete=models.CASCADE, related_name='output')
    text_output = models.TextField(blank=True, null=True)
    error_output = models.TextField(blank=True, null=True)
    image_output = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Output for {self.cell.id}"

class Link(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    platform = models.CharField(max_length=50)
    url = models.TextField()
    icon_class = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.platform}: {self.url}"
