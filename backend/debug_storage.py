
import os
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
BUCKET = os.getenv('SUPABASE_STORAGE_BUCKET', 'portfolio-assets')

def debug_notebook():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment.")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    target_path = "blogs/c46edd30-af63-4b34-8ec0-5c6e1472fc06/notebooks/1ded5ef5-de5b-450b-9849-8a767283a3e5.ipynb"
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{target_path}"

    print(f"--- Testing Public URL ---")
    print(f"URL: {public_url}")
    try:
        resp = requests.get(public_url)
        print(f"Status: {resp.status_code}")
        print(f"Content-Type: {resp.headers.get('Content-Type')}")
        if resp.status_code != 200:
            print(f"Response Body: {resp.text}")
    except Exception as e:
        print(f"Request failed: {e}")

    print(f"\n--- Checking Object Existence ---")
    try:
        # List directory
        res = supabase.storage.from_(BUCKET).list(path=f"blogs/c46edd30-af63-4b34-8ec0-5c6e1472fc06/notebooks/")
        print(f"Files in directory: {res}")

        # Try to download
        try:
            supabase.storage.from_(BUCKET).download(path=target_path)
            print(f"Success: Object exists and is accessible via service key.")
        except Exception as e:
            print(f"Failure: Object not accessible via service key: {e}")

    except Exception as e:
        print(f"Error listing directory: {e}")

if __name__ == "__main__":
    debug_notebook()
