
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def check_bucket_visibility():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Error: Missing environment variables.")
        return

    print(f"Targeting Project: {SUPABASE_URL}")

    # Use the SERVICE KEY to check the bucket's actual configuration
    # The /storage/v1/bucket endpoint requires authorization
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
    }
    url = f"{SUPABASE_URL}/storage/v1/bucket"

    print(f"\n--- Checking Bucket Config (Admin Perspective) ---")
    try:
        resp = requests.get(url, headers=headers)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            buckets = resp.json()
            print(f"Found {len(buckets)} buckets:")
            for b in buckets:
                name = b.get('id')
                public = b.get('public')
                print(f"- '{name}' (Public: {public})")
                if name == 'portfolio-assets':
                    print("  MATCH FOUND: 'portfolio-assets' is exactly as spelled.")
        else:
            print(f"Error: {resp.text}")

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    check_bucket_visibility()
