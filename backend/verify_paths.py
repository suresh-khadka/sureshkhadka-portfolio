
import os
import requests
import psycopg2
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Credentials
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
DATABASE_URL = os.getenv('DATABASE_URL')
BUCKET = os.getenv('SUPABASE_STORAGE_BUCKET', 'portfolio-assets')

def verify_everything():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY or not DATABASE_URL:
        print("Error: Missing environment variables.")
        return

    # 1. Verify Supabase Object
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    target_path = "blogs/c46edd30-af63-4b34-8ec0-5c6e1472fc06/notebooks/1ded5ef5-de5b-450b-9849-8a767283a3e5.ipynb"

    print(f"--- Step 1: Supabase Storage Verification ---")
    try:
        supabase.storage.from_(BUCKET).download(path=target_path)
        print(f"SUCCESS: Object exists at path: {target_path}")
        object_exists = True
    except Exception as e:
        print(f"FAILURE: Object does NOT exist at path {target_path}: {e}")
        object_exists = False

    # 2. Verify Database Record
    print(f"\n--- Step 2: Database Verification ---")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # We check for the notebook by ID
        notebook_id = "1ded5ef5-de5b-450b-9849-8a767283a3e5"
        cur.execute("SELECT storage_path FROM content_notebook WHERE id = %s", (notebook_id,))
        row = cur.fetchone()

        if row:
            db_storage_path = row[0]
            print(f"SUCCESS: Notebook found in DB. storage_path = '{db_storage_path}'")
        else:
            db_storage_path = None
            print(f"FAILURE: Notebook {notebook_id} not found in database.")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error querying database: {e}")
        db_storage_path = None

    # 3. Comparison
    print(f"\n--- Step 3: Comparison ---")
    if db_storage_path and object_exists:
        if db_storage_path == target_path:
            print("MATCH: Database storage_path exactly matches the Supabase object path.")
        else:
            print(f"MISMATCH!")
            print(f"  DB Path: {db_storage_path}")
            print(f"  Storage Path: {target_path}")
    else:
        print("Could not perform comparison due to missing data.")

    # 4. Frontend URL Construction Simulation
    print(f"\n--- Step 4: Frontend URL Construction ---")
    if db_storage_path:
        # Simulation of NotebookContainer.tsx logic
        # const notebookUrl = `${baseUrl}/storage/v1/object/public/portfolio-assets/${notebook.storage_path}`;
        simulated_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{db_storage_path}"
        print(f"Simulated Frontend URL: {simulated_url}")

        # Test the simulated URL (should fail 400 until bucket is public)
        try:
            resp = requests.get(simulated_url)
            print(f"Simulated URL Status: {resp.status_code}")
        except Exception as e:
            print(f"Simulated URL request failed: {e}")

if __name__ == "__main__":
    verify_everything()
