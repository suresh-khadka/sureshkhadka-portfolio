from rest_framework import serializers
from .models import VisitorSession, PageView, BlogReadEvent

class VisitorSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorSession
        fields = ['session_id', 'user_agent', 'location_summary']

class PageViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageView
        fields = ['session', 'path', 'referrer']

class BlogReadEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogReadEvent
        fields = ['blog', 'session', 'seconds_spent', 'scroll_depth']
