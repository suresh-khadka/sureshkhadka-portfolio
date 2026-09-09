import io
import os
from PIL import Image
from content.utils import compress_image

# Create a realistic synthetic photograph (noisy image)
print("Creating a realistic noisy image (4000x4000)...")
import numpy as np
# Generate a random noise image to simulate photographic complexity
arr = np.random.randint(0, 256, (4000, 4000, 3), dtype='uint8')
img = Image.fromarray(arr)
buf = io.BytesIO()
img.save(buf, format='JPEG')
original_bytes = buf.getvalue()
print(f"Original size: {len(original_bytes) / 1024:.2f} KB")

compressed_bytes = compress_image(original_bytes)
print(f"Compressed size: {len(compressed_bytes) / 1024:.2f} KB")

out_img = Image.open(io.BytesIO(compressed_bytes))
print(f"Compressed dimensions: {out_img.size}")
print(f"Compressed format: {out_img.format}")
