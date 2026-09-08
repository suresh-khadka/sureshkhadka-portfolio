import pytest
from content.models import Project, BlogPost, Tag, Skill, SkillCategory
from django.urls import reverse

@pytest.mark.django_db
def test_public_read_projects(public_client):
    # Setup: Create a project
    Project.objects.create(title="Test Project", slug="test-project", description="Desc")

    url = reverse('project-list')
    response = public_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['title'] == "Test Project"

@pytest.mark.django_db
def test_public_read_blog_drafts_hidden(public_client):
    # Setup: Create one published and one draft blog
    BlogPost.objects.create(title="Published", slug="pub", content="Content", is_draft=False)
    BlogPost.objects.create(title="Draft", slug="draft", content="Content", is_draft=True)

    url = reverse('blog-list')
    response = public_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['title'] == "Published"

@pytest.mark.django_db
def test_admin_create_project(api_client):
    url = reverse('project-list')
    data = {
        "title": "Admin Project",
        "slug": "admin-project",
        "description": "Created by admin"
    }
    response = api_client.post(url, data)

    assert response.status_code == 201
    assert Project.objects.filter(slug="admin-project").exists()

@pytest.mark.django_db
def test_public_cannot_create_project(public_client):
    url = reverse('project-list')
    data = {
        "title": "Hacker Project",
        "slug": "hacker-project",
        "description": "Should fail"
    }
    response = public_client.post(url, data)

    assert response.status_code in [401, 403]

@pytest.mark.django_db
def test_admin_update_project(api_client):
    project = Project.objects.create(title="Old Title", slug="old-slug", description="Old Desc")
    url = reverse('project-detail', kwargs={'slug': 'old-slug'})

    data = {"title": "New Title", "description": "New Desc"}
    response = api_client.patch(url, data)

    assert response.status_code == 200
    project.refresh_from_db()
    assert project.title == "New Title"

@pytest.mark.django_db
def test_admin_delete_project(api_client):
    project = Project.objects.create(title="Delete Me", slug="delete-me", description="Desc")
    url = reverse('project-detail', kwargs={'slug': 'delete-me'})

    response = api_client.delete(url)

    assert response.status_code == 204
    assert not Project.objects.filter(slug="delete-me").exists()
