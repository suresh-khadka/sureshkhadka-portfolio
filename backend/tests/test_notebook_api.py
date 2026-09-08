import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from content.models import Blog, BlogSection, BlogCell

@pytest.mark.django_db
def test_blog_nested_api():
    client = APIClient()
    # Set is_draft=False so it's visible to the public API
    blog = Blog.objects.create(title="Test Blog", slug="test-blog", intro="Intro", is_draft=False)
    section = BlogSection.objects.create(blog=blog, title="Section 1", order=0)
    cell = BlogCell.objects.create(section=section, cell_type='markdown', content="Hello", order=0)

    url = reverse('blog-detail', kwargs={'slug': 'test-blog'})
    response = client.get(url)

    assert response.status_code == 200
    data = response.data
    assert data['title'] == "Test Blog"
    assert len(data['sections']) == 1
    assert data['sections'][0]['title'] == "Section 1"
    assert len(data['sections'][0]['cells']) == 1
    assert data['sections'][0]['cells'][0]['content'] == "Hello"

@pytest.mark.django_db
def test_section_reorder():
    client = APIClient()
    from django.contrib.auth.models import User
    user = User.objects.create_superuser(username='admin', password='password', email='admin@test.com')
    client.force_authenticate(user=user)

    blog = Blog.objects.create(title="Test Blog", slug="test-blog", intro="Intro")
    s1 = BlogSection.objects.create(blog=blog, title="S1", order=0)
    s2 = BlogSection.objects.create(blog=blog, title="S2", order=1)

    url = reverse('blog-sections-reorder', kwargs={'slug': 'test-blog'})
    # Ensure we send UUID strings
    response = client.patch(url, {'order': [str(s2.id), str(s1.id)]})

    assert response.status_code == 200
    s1.refresh_from_db()
    s2.refresh_from_db()
    assert s2.order == 0
    assert s1.order == 1
