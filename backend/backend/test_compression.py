import requests
from content.utils import compress_image

url = 'https://jcgjycysmrjkaslfmezd.supabase.co/storage/v1/object/public/portfolio-assets/portfolio-assets/6093bb9b-0593-4643-95e4-551e4ab8d78d.webp'
print(f"Downloading image from {url}...")
response = requests.get(url)
if response.status_code == 200:
    original_bytes = response.content
    print(f"Original size: {len(original_bytes) / 1024:.2f} KB")

    compressed_bytes = compress_image(original_bytes)
    print(f"Compressed size: {len(compressed_bytes) / 1024:.2f} KB")
else:
    print(f"Failed to download image: {response.status_code}")
