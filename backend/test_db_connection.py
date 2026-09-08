import os
import psycopg2
import environ
from pathlib import Path

# Setup environment
env = environ.Env()
BASE_DIR = Path(__file__).resolve().parent
environ.Env.read_env(env_file=str(BASE_DIR / '.env'))

def test_connection():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("Error: DATABASE_URL not found in environment")
        return

    print(f"Attempting to connect to: {db_url.split('@')[0]}@ {db_url.split('@')[1].split('/')[0]}")
    
    try:
        # We use the connection string directly
        conn = psycopg2.connect(db_url, sslmode='require')
        print("✅ Connection successful!")
        conn.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == '__main__':
    test_connection()
