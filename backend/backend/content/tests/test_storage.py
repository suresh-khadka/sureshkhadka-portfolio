from django.test import TestCase, RequestFactory
from unittest.mock import MagicMock, patch
from content.models import Blog
from content.utils import extract_path_from_url
from content.views import BlogDetailView
from rest_framework.response import Response

class StorageHygieneTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.test_url = "https://jcgjycysmrjkaslfmezd.supabase.co/storage/v1/object/public/portfolio-assets/blogs/c46edd30-af63-4b34-8ec0-5c6e1472fc06/cover/cb78c0f6-bc47-4ed7-bdf2-05ac99c8fac9.webp"
        self.expected_path = "blogs/c46edd30-af63-4b34-8ec0-5c6e1472fc06/cover/cb78c0f6-bc47-4ed7-bdf2-05ac99c8fac9.webp"

    def test_extract_path_from_url(self):
        """Verify that the public URL is correctly converted to a bucket-relative path."""
        path = extract_path_from_url(self.test_url)
        self.assertEqual(path, self.expected_path)

    @patch('content.views.delete_file_from_supabase')
    def test_blog_update_triggers_deletion(self, mock_delete):
        """Verify that updating a blog's cover image triggers deletion of the old file."""
        blog = Blog.objects.create(title="Test Blog", slug="test-blog", cover_image_url=self.test_url)

        new_url = "https://jcgjycysmrjkaslfmezd.supabase.co/storage/v1/object/public/portfolio-assets/new-image.webp"
        request = self.factory.patch('PATCH', f'/blogs/{blog.slug}/')
        request.user = MagicMock()
        request.user.is_superuser = True
        request.data = {'cover_image_url': new_url}

        view = BlogDetailView()
        view.get_object = MagicMock(return_value=blog)

        with patch('rest_framework.generics.RetrieveUpdateDestroyAPIView.update', return_value=Response()):
            view.update(request)

        mock_delete.assert_called_once_with(self.expected_path)
