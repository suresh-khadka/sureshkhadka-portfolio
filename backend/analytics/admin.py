from django.contrib import admin
from .models import VisitorSession, PageView, BlogReadEvent

@admin.register(VisitorSession)
class VisitorSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'first_seen', 'last_seen', 'location_summary')

@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ('path', 'timestamp', 'session')
    list_filter = ('timestamp',)

@admin.register(BlogReadEvent)
class BlogReadEventAdmin(admin.ModelAdmin):
    list_display = ('blog', 'seconds_spent', 'scroll_depth', 'timestamp')
    list_filter = ('timestamp',)
