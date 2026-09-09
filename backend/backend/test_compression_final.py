import io
import numpy as np
from PIL import Image
from content.utils import compress_image

def test_transparency():
    print("Testing transparency handling...")
    # Create a PNG with a red circle on a transparent background
    # 1000x1000, RGBA
    arr = np.zeros((1000, 1000, 4), dtype='uint8')
    # Make a red circle in the middle
    for i in range(1000):
        for j in range(1000):
            if (i-500)**2 + (j-500)**2 < 200**2:
                arr[i, j] = [255, 0, 0, 255] # Red, Opaque
            else:
                arr[i, j] = [0, 0, 0, 0] # Transparent

    img = Image.fromarray(arr, 'RGBA')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    original_bytes = buf.getvalue()

    compressed_bytes = compress_image(original_bytes)
    out_img = Image.open(io.BytesIO(compressed_bytes))

    # Check a pixel that was transparent (e.g., 0,0)
    # It should now be white (255, 255, 255)
    pixel = out_img.getpixel((0, 0))
    print(f"Pixel at (0,0) [was transparent]: {pixel}")

    if pixel == (255, 255, 255):
        print("SUCCESS: Transparent area converted to white background.")
    else:
        print(f"FAILURE: Transparent area converted to {pixel}")

def test_quality_value():
    print("\nTesting quality value for noisy image...")
    # Re-generate the noisy image from previous test
    arr = np.random.randint(0, 256, (4000, 4000, 3), dtype='uint8')
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    original_bytes = buf.getvalue()

    # We need to know the final quality.
    # Since compress_image doesn't return it, we'll replicate the loop here
    # using the exact same logic in utils.py to find the value.

    # Logic from utils.py:
    max_size_kb = 300
    max_dim = 1600

    # Resize
    width, height = img.size
    if max(width, height) > max_dim:
        img = img.resize((max_dim, max_dim), Image.Resampling.LANCZOS)

    quality = 80
    output = io.BytesIO()
    img.save(output, format="WEBP", quality=quality)

    while output.tell() > max_size_kb * 1024 and quality > 30:
        quality -= 10
        output = io.BytesIO()
        img.save(output, format="WEBP", quality=quality)

    print(f"Final quality value for noisy image: {quality}")
    print(f"Final size: {output.tell() / 1024:.2f} KB")

if __name__ == '__main__':
    test_transparency()
    test_quality_value()
