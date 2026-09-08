from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Count, Avg, F
from django.db.models.functions import TruncDate
from .models import VisitorSession, PageView, BlogReadEvent
from .serializers import PageViewSerializer, BlogReadEventSerializer, VisitorSessionSerializer
from accounts.permissions import IsOwnerAdmin
from django.utils.timezone import now

# --- TRACKING VIEWS (Public) ---

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

        session, created = VisitorSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'user_agent': data.get('user_agent'),
                'location_summary': data.get('location_summary')
            }
        )
        session.last_seen = now()
        session.save()

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
        blog_id = data.get('blog')

        if not session_id or not blog_id:
            return Response({'error': 'session_id and blog_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = VisitorSession.objects.get(session_id=session_id)
            session.last_seen = now()
            session.save()
        except VisitorSession.DoesNotExist:
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

# --- AGGREGATION VIEWS (Admin Only) ---

class AnalyticsOverviewView(APIView):
    """
    Provides high-level overview metrics.
    """
    permission_classes = [IsOwnerAdmin]

    def get(self, request):
        total_visitors = VisitorSession.objects.count()
        total_page_views = PageView.objects.count()

        # Total unique visitors over the last 30 days
        # (This is a simple version; in production we'd use a date filter)

        return Response({
            'total_visitors': total_visitors,
            'total_page_views': total_page_views,
        })

class VisitorsOverTimeView(APIView):
    """
    Returns daily visitor counts for a chart.
    """
    permission_classes = [IsOwnerAdmin]

    def get(self, request):
        data = (
            VisitorSession.objects.annotate(date=TruncDate('first_seen'))
            .values('date')
            .annotate(count=Count('session_id'))
            .order_by('date')
        )
        # Format as list of {date: "...", count: ...}
        return Response(list(data), status=status.HTTP_200_OK)

class MostReadBlogsView(APIView):
    """
    Returns blogs sorted by total read events and average time spent.
    """
    permission_classes = [IsOwnerAdmin]

    def get(self, request):
        data = (
            BlogReadEvent.objects.values('blog')
            .annotate(
                total_reads=Count('id'),
                avg_time=Avg('seconds_spent')
            )
            .order_by('-total_reads')
        )
        return Response(list(data), status=status.HTTP_200_OK)

class PageViewCountsView(APIView):
    """
    Returns hit counts per path.
    """
    permission_classes = [IsOwnerAdmin]

    def get(self, request):
        data = (
            PageView.objects.values('path')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        return Response(list(data), status=status.HTTP_200_OK)

class ActiveSessionsView(APIView):
    """
    Returns a list of sessions active in the last 15 minutes.
    """
    permission_classes = [IsOwnerAdmin]

    def get(self, request):
        from datetime import timedelta
        threshold = now() - timedelta(minutes=15)

        sessions = VisitorSession.objects.filter(last_seen__gte=threshold)

        # For each active session, get the last page they viewed
        results = []
        for s in sessions:
            last_page = PageView.objects.filter(session=s).order_by('-timestamp').first()
            results.append({
                'session_id': s.session_id,
                'location': s.location_summary,
                'current_page': last_page.path if last_page else 'Unknown',
                'last_seen': s.last_seen
            })

        return Response(results, status=status.HTTP_200_OK)
