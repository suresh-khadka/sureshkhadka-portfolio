import pytest
import uuid
from analytics.models import VisitorSession, PageView, BlogReadEvent
from content.models import BlogPost
from django.urls import reverse

@pytest.mark.django_db
def test_track_pageview(public_client):
    session_id = str(uuid.uuid4())
    url = reverse('track-pageview')
    data = {
        "session_id": session_id,
        "path": "/home",
        "referrer": "google.com",
        "user_agent": "Mozilla/5.0",
        "location_summary": "New York, USA"
    }
    response = public_client.post(url, data)

    assert response.status_code == 201
    assert VisitorSession.objects.filter(session_id=session_id).exists()
    assert PageView.objects.filter(path="/home").exists()

@pytest.mark.django_db
def test_track_blog_read(public_client):
    blog = BlogPost.objects.create(title="Test Blog", slug="test-blog", content="Content")
    session_id = str(uuid.uuid4())
    url = reverse('track-blog-read')
    data = {
        "session_id": session_id,
        "blog": blog.id,
        "seconds_spent": 120,
        "scroll_depth": 75
    }
    response = public_client.post(url, data)

    assert response.status_code == 201
    assert BlogReadEvent.objects.filter(blog=blog, seconds_spent=120).exists()

@pytest.mark.django_db
def test_analytics_aggregation_admin_only(public_client, api_client):
    # Setup some data
    session_id = str(uuid.uuid4())
    VisitorSession.objects.create(session_id=session_id)
    PageView.objects.create(session_id=session_id, path="/home")

    url = reverse('analytics-overview')

    # Public should be rejected
    response_pub = public_client.get(url)
    assert response_pub.status_code in [401, 403]

    # Admin should be allowed
    response_admin = api_client.get(url)
    assert response_admin.status_code == 200
    assert response_admin.data['total_visitors'] == 1

@pytest.mark.django_db
def test_most_read_blogs_aggregation(api_client):
    blog1 = BlogPost.objects.create(title="Blog 1", slug="b1", content="C1")
    blog2 = BlogPost.objects.create(title="Blog 2", slug="b2", content="C2")
    session_id = str(uuid.uuid4())
    session = VisitorSession.objects.create(session_id=session_id)

    # Blog 1 read 3 times
    for _ in range(3):
        BlogReadEvent.objects.create(blog=blog1, session=session, seconds_spent=10, scroll_depth=50)
    # Blog 2 read 1 time
    BlogReadEvent.objects.create(blog=blog2, session=session, seconds_spent=100, scroll_depth=90)

    url = reverse('most-read-blogs')
    response = api_client.get(url)

    assert response.status_code == 200
    # Blog 1 should be first
    assert response.data[0]['total_reads'] == 3
    assert response.data[0]['blog'] == blog1.id
    assert response.data[1]['total_reads'] == 1
    assert response.data[1]['avg_time'] == 100
