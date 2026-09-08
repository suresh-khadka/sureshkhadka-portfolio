import pytest
from django.contrib.auth.models import User

@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(username='testadmin', password='password123', email='admin@test.com')

@pytest.fixture
def api_client(admin_user):
    from rest_framework.test import APIClient
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client

@pytest.fixture
def public_client():
    from rest_framework.test import APIClient
    return APIClient()
