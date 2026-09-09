import unittest
from unittest.mock import MagicMock, patch
from django.test import RequestFactory
from content.models import Blog
from content.utils import extract_path_from_url
from content.views import BlogDetailView
from rest_framework.response import Response

class StorageHygieneTest(unittest.TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        # We use a real URL format from the project
        self.test_url = "https://jcgjycysmrjkaslfmezd.supabase.co/storage/v1/object/public/portfolio-assets/blogs/c46edd30-af63-4b34-8ec0-5c6e1472fc06/cover/cb78c0f6-bc47-4ed7-bdf2-05ac99c8fac9.webp"
        self.expected_path = "blogs/c46edd30-af63-4b34-8ec0-5c6e1472fc06/cover/cb78c0f6-bc47-4ed7-bdf2-05ac99c8fac9.webp"

    def test_extract_path_from_url(self):
        """Verify that the public URL is correctly converted to a bucket-relative path."""
        path = extract_path_from_url(self.test_url)
        self.assertEqual(path, self.expected_path, f"Expected {self.expected_path}, got {path}")

    @patch('content.views.delete_file_from_supabase')
    def test_blog_update_triggers_deletion(self, mock_delete):
        """Verify that updating a blog's cover image triggers deletion of the old file."""
        # Setup: Mock a blog with an existing cover image
        with patch('content.models.Blog.objects.get') as mock_get:
            mock_blog = MagicMock()
            mock_blog.cover_image_url = self.test_url
            mock_blog.slug = "test-blog"
            mock_get.return_value = mock_blog

            # Setup: Mock request with a new cover URL
            new_url = "https://jcgjycysmrjkaslfmezd.supabase.co/storage/v1/object/public/portfolio-assets/new-image.webp"
            request = self.factory.patch('PATCH', f'/blogs/{mock_blog.slug}/')
            request.user = MagicMock()
            request.user.is_superuser = True
            # DRF views expect request.data
            request.data = {'cover_image_url': new_url}

            # Mock the view
            view = BlogDetailView()
            view.get_object = MagicMock(return_value=mock_blog)
            # Mock super().update to avoid actual DB save
            with patch('rest_framework.generics.RetrieveUpdateDestroyAPIView.update', return_value=Response()):
                view.update(request)

            # Verification: delete_file_from_supabase should have been called with the relative path
            mock_delete.assert_called_once_with(self.expected_path)

if __name__ == '__main__':
    unittest.main()
