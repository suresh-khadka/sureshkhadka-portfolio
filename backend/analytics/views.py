from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import VisitorSession, PageView, BlogReadEvent
from .serializers import PageViewSerializer, BlogReadEventSerializer, VisitorSessionSerializer
from django.utils.timezone import now

class TrackPageViewView(APIView):
    """
    Tracks a page view event.
    Expects: session_id, path, referrer, user_agent, location_summary
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        session_id = data.get('session_id')
        path = data.get('path')

        if not session_id or not path:
            return Response({'error': 'session_id and path are required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update or create the Visitor Session
        session, created = VisitorSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'user_agent': data.get('user_agent'),
                'location_summary': data.get('location_summary')
            }
        )
        session.last_seen = now()
        session.save()

        # 2. Record the Page View
        serializer = PageViewSerializer(data=data)
        if serializer.is_valid():
            serializer.save(session=session)
            return Response({'status': 'recorded'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TrackBlogReadView(APIView):
    """
    Tracks engagement metrics for a blog post.
    Expects: session_id, blog_id, seconds_spent, scroll_depth
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        session_id = data.get('session_id')
        blog_id = data.get('blog') # Serializer expects 'blog'

        if not session_id or not blog_id:
            return Response({'error': 'session_id and blog_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Update session last seen
        try:
            session = VisitorSession.objects.get(session_id=session_id)
            session.last_seen = now()
            session.save()
        except VisitorSession.DoesNotExist:
            # Create session if it doesn't exist (though it should have been created by a page view)
            VisitorSession.objects.create(session_id=session_id)

        serializer = BlogReadEventSerializer(data=data)
        if serializer.is_valid():
            serializer.save(session=VisitorSession.objects.get(session_id=session_id))
            return Response({'status': 'recorded'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SessionHeartbeatView(APIView):
    """
    Updates the last_seen timestamp for a session to keep it active.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'session_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = VisitorSession.objects.get(session_id=session_id)
            session.last_seen = now()
            session.save()
            return Response({'status': 'updated'}, status=status.HTTP_200_OK)
        except VisitorSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
