import io
import requests
from PIL import Image
from content.utils import compress_image

# A realistic high-res photographic image (~4MB)
url = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg'
print(f"Downloading photographic image from {url}...")
response = requests.get(url)
if response.status_code == 200:
    original_bytes = response.content
    print(f"Original size: {len(original_bytes) / 1024:.2f} KB")

    # We'll use a modified version of compress_image that returns the final quality
    # Since we can't easily change the util function without editing the file,
    # we'll just call it and check the result.
    compressed_bytes = compress_image(original_bytes)
    print(f"Compressed size: {len(compressed_bytes) / 1024:.2f} KB")

    # Check final dimensions and format
    out_img = Image.open(io.BytesIO(compressed_bytes))
    print(f"Compressed dimensions: {out_img.size}")
    print(f"Compressed format: {out_img.format}")
else:
    print(f"Failed to download image: {response.status_code}")
