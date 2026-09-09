
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# We need the ANON KEY (public key) to test what the frontend sees
# Note: The backend .env contains the SERVICE KEY, but we need the ANON key.
# I will search for it in .env files or look for it.
SUPABASE_URL = os.getenv('SUPABASE_URL')
# If SUPABASE_ANON_KEY is not in .env, I'll try to find it or ask.
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

def audit_buckets():
    if not SUPABASE_URL:
        print("Error: SUPABASE_URL not found.")
        return

    print(f"Targeting Project: {SUPABASE_URL}")

    # 1. Try to list buckets using the ANON key (simulating frontend)
    headers = {"apikey": SUPABASE_ANON_KEY} if SUPABASE_ANON_KEY else {}
    url = f"{SUPABASE_URL}/storage/v1/bucket"

    print(f"\n--- Testing /storage/v1/bucket (Frontend Perspective) ---")
    try:
        resp = requests.get(url, headers=headers)
        print(f"Status: {resp.status_code}")
        print(f"Response Body: {resp.text}")

        if resp.status_code == 200:
            buckets = resp.json()
            print(f"Found {len(buckets)} buckets:")
            for b in buckets:
                name = b.get('id')
                print(f"- '{name}' (Public: {b.get('public')})")

                if name == 'portfolio-assets':
                    print("  MATCH FOUND: 'portfolio-assets' exists.")
                elif name and 'portfolio' in name.lower():
                    print(f"  SIMILAR BUCKET FOUND: '{name}'")
        else:
            print("Could not list buckets using anon key. This is expected if 'list' permissions are not granted to anon role.")

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    audit_buckets()
