import os
import uuid
from supabase import create_client, Client
from django.conf import settings

def get_supabase_client() -> Client:
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    if not url or not key:
        raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in environment")
    return create_client(url, key)

def upload_file_to_supabase(file, folder='portfolio-assets'):
    """
    Uploads a file to Supabase Storage and returns the public URL.
    """
    supabase = get_supabase_client()

    # Create a unique file path
    file_extension = os.path.splitext(file.name)[1]
    file_path = f"{folder}/{uuid.uuid4()}{file_extension}"

    # Upload the file
    # file.read() returns bytes
    supabase.storage.from_(folder).upload(
        path=file_path,
        file=file.read(),
        file_options={"content-type": file.content_type}
    )

    # Get public URL
    public_url = supabase.storage.from_(folder).get_public_url(file_path)
    return public_url
