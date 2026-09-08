import uuid
from django.db import models
from content.models import BlogPost

class VisitorSession(models.Model):
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    user_agent = models.TextField(blank=True, null=True)
    location_summary = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Session {self.session_id}"

class PageView(models.Model):
    session = models.ForeignKey(VisitorSession, on_delete=models.SET_NULL, null=True, related_name='page_views')
    path = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    referrer = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.path} at {self.timestamp}"

class BlogReadEvent(models.Model):
    blog = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='read_events')
    session = models.ForeignKey(VisitorSession, on_delete=models.SET_NULL, null=True, related_name='blog_read_events')
    seconds_spent = models.IntegerField()
    scroll_depth = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Read {self.blog} - {self.seconds_spent}s"
