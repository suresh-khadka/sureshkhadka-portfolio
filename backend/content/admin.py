from django.contrib import admin
from .models import SkillCategory, Skill, Project, Tag, Blog, BlogSection, BlogCell, BlogCellOutput, Link

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'proficiency_level')
    list_filter = ('category',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'published_at', 'is_draft')
    list_filter = ('is_draft',)
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)

@admin.register(BlogSection)
class BlogSectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'blog', 'order')

@admin.register(BlogCell)
class BlogCellAdmin(admin.ModelAdmin):
    list_display = ('section', 'cell_type', 'order')

@admin.register(BlogCellOutput)
class BlogCellOutputAdmin(admin.ModelAdmin):
    list_display = ('cell',)

@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = ('platform', 'url')
