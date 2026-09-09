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
    try:
        res = supabase.storage.from_(BUCKET).list(path=path)
        for item in res:
            full_path = f"{path}/{item['name']}".lstrip('/')
            if item.get('id') is None:
                list_recursive(full_path)
            else:
                all_files.append(full_path)
    except Exception as e:
        print(f"Error listing {path}: {e}")

list_recursive()
all_files.sort()

print("BUCKET_PATHS_START")
for f in all_files:
    print(f)
print("BUCKET_PATHS_END")
