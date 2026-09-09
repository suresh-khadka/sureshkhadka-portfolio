import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('backend/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
BUCKET = 'portfolio-assets'

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

all_files = []

def list_recursive(path=''):
    print(f"Listing: {path if path else 'root'}")
    try:
        # Use options to increase limit
        res = supabase.storage.from_(BUCKET).list(path=path, options={'limit': 100})
        for item in res:
            full_path = f"{path}/{item['name']}".lstrip('/')
            # Check if it's a folder. In Supabase, folders have id=None
            if item.get('id') is None:
                list_recursive(full_path)
            else:
                all_files.append(full_path)
    except Exception as e:
        print(f"Error listing {path}: {e}")

list_recursive()
all_files.sort()

print("\n--- FINAL EXHAUSTIVE LIST ---")
for f in all_files:
    print(f)
