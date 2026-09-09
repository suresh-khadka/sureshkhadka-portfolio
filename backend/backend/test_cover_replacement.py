import os
from django.setup import setup_django
from content.models import Blog
from content.utils import extract_path_from_url, delete_file_from_supabase

# Mocking Django environment is tricky in a script, better to use manage.py shell.
# But I'll just write a script that I can run via python manage.py shell.
