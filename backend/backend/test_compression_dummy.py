import io
from PIL import Image
from content.utils import compress_image

# Create a large dummy image (4000x4000)
print("Creating a large dummy image (4000x4000)...")
img = Image.new('RGB', (4000, 4000), color = (73, 109, 137))
buf = io.BytesIO()
img.save(buf, format='JPEG')
original_bytes = buf.getvalue()
print(f"Original size: {len(original_bytes) / 1024:.2f} KB")

compressed_bytes = compress_image(original_bytes)
print(f"Compressed size: {len(compressed_bytes) / 1024:.2f} KB")

# Verify dimensions
out_img = Image.open(io.BytesIO(compressed_bytes))
print(f"Compressed dimensions: {out_img.size}")
