import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('backend/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
BUCKET = 'portfolio-assets'

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("Listing contents of 'portfolio-assets/' folder...")
try:
    res = supabase.storage.from_(BUCKET).list(path='portfolio-assets')
    print(res)
except Exception as e:
    print(f"Error: {e}")
