import requests
from content.utils import compress_image
import io

# Using a high-res public image for demonstration
url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_digital_camera.jpg/1280px-Image_created_with_a_digital_camera.jpg'
print(f"Downloading test image from {url}...")
response = requests.get(url)
if response.status_code == 200:
    original_bytes = response.content
    print(f"Original size: {len(original_bytes) / 1024:.2f} KB")

    compressed_bytes = compress_image(original_bytes)
    print(f"Compressed size: {len(compressed_bytes) / 1024:.2f} KB")

    # Verify dimensions of the output
    from PIL import Image
    out_img = Image.open(io.BytesIO(compressed_bytes))
    print(f"Compressed dimensions: {out_img.size}")
else:
    print(f"Failed to download image: {response.status_code}")
