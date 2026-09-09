import os
import uuid
import io
from PIL import Image
from supabase import create_client, Client
from django.conf import settings


def get_supabase_client() -> Client:
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    if not url or not key:
        raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in environment")
    return create_client(url, key)

def delete_file_from_supabase(file_path, bucket='portfolio-assets'):
    """
    Deletes a file from Supabase Storage.
    file_path should be the path relative to the bucket.
    """
    supabase = get_supabase_client()
    try:
        supabase.storage.from_(bucket).remove([file_path])
        return True
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
        return False

def extract_path_from_url(url, bucket='portfolio-assets'):
    """
    Extracts the storage path from a Supabase public URL.
    Example URL: https://xyz.supabase.co/storage/v1/object/public/portfolio-assets/path/to/file.webp
    Returns: path/to/file.webp
    """
    if not url:
        return None

    # The public URL contains /public/[bucket]/[path]
    marker = f"/public/{bucket}/"
    if marker in url:
        return url.split(marker)[-1]
    return None

def compress_image(image_bytes, max_size_kb=300, max_dim=1600):
    """
    Compresses and resizes image bytes.
    - Caps maximum dimension to max_dim (preserving aspect ratio).
    - Composites transparency onto a white background.
    - Saves as WebP with quality 80.
    - Iteratively reduces quality if the resulting size still exceeds max_size_kb.
    Returns processed bytes.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))

        # 1. Cap maximum dimension to 1600px
        width, height = img.size
        if max(width, height) > max_dim:
            if width > height:
                new_width = max_dim
                new_height = int(height * (max_dim / width))
            else:
                new_height = max_dim
                new_width = int(width * (max_dim / height))
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # 2. Composite transparency onto white background
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGBA")
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1])
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # 3. Initial attempt: save as WebP with quality 80
        quality = 80
        output = io.BytesIO()
        img.save(output, format="WEBP", quality=quality)

        # 4. Iteratively reduce quality if still too large
        while output.tell() > max_size_kb * 1024 and quality > 30:
            quality -= 10
            output = io.BytesIO()
            img.save(output, format="WEBP", quality=quality)

        return output.getvalue()
    except Exception as e:
        print(f"Compression error: {e}")
        return image_bytes

def parse_notebook_and_save_cells(notebook, notebook_json, supabase):
    """
    Parses notebook JSON and populates BlogCell and BlogCellOutput.
    """
    from content.models import BlogCell, BlogCellOutput

    section = notebook.section
    BlogCell.objects.filter(section=section).delete()

    for idx, cell in enumerate(notebook_json.get('cells', [])):
        cell_type = cell.get('cell_type', 'markdown')
        source = cell.get('source', [])
        if isinstance(source, list):
            source = "".join(source)

        blog_cell = BlogCell.objects.create(
            section=section,
            cell_type=cell_type,
            content=source,
            language=cell.get('metadata', {}).get('language', 'python') if cell_type == 'code' else 'markdown',
            order=idx
        )

        outputs = cell.get('outputs', [])
        for output in outputs:
            out_type = output.get('output_type')
            data_dict = output.get('data', {})

            text_out = None
            html_out = None
            error_out = None
            image_out = None

            if out_type == 'stream':
                text_out = "".join(output.get('text', []))
            elif out_type == 'error':
                error_out = output.get('ename', '') + ": " + output.get('evalue', '')
            elif out_type in ('display_data', 'execute_result'):
                image_mime = None
                for mime in ['image/png', 'image/jpeg', 'image/svg+xml']:
                    if mime in data_dict:
                        image_mime = mime
                        break

                if image_mime:
                    base64_data = data_dict[image_mime]
                    try:
                        if ',' in base64_data:
                            base64_data = base64_data.split(',')[1]
                        img_bytes = base64.b64decode(base64_data)

                        class SupabaseFile:
                            def __init__(self, content, name, content_type):
                                self.content = content
                                self.name = name
                                self.content_type = content_type
                            def read(self): return self.content
                            def seek(self, offset, whence=0): pass
                            def tell(self): return 0

                        file_obj = SupabaseFile(
                            img_bytes,
                            f"output_{uuid.uuid4()}.png",
                            'image/png' if 'png' in image_mime else 'image/jpeg'
                        )
                        blog_id = section.blog.id
                        custom_path = f"blogs/{blog_id}/notebooks/{notebook.id}/outputs/{uuid.uuid4()}.png"
                        public_url, _ = upload_file_to_supabase(file_obj, custom_path=custom_path)
                        image_out = public_url
                    except Exception:
                        pass

                if 'text/plain' in data_dict:
                    text_out = "\n".join(data_dict['text/plain']) if isinstance(data_dict['text/plain'], list) else data_dict['text/plain']
                if 'text/html' in data_dict:
                    html_out = "".join(data_dict['text/html']) if isinstance(data_dict['text/html'], list) else data_dict['text/html']

            if text_out or html_out or error_out or image_out:
                BlogCellOutput.objects.create(
                    cell=blog_cell,
                    text_output=text_out,
                    html_output=html_out,
                    error_output=error_out,
                    image_output=image_out
                )

def upload_file_to_supabase(file, folder='portfolio-assets', custom_path=None):
    """
    Uploads a file to Supabase Storage and returns the public URL.
    If custom_path is provided, it uses that instead of generating a UUID path.
    """
    supabase = get_supabase_client()

    if custom_path:
        file_path = custom_path
    else:
        # Create a unique file path
        file_extension = os.path.splitext(file.name)[1]
        file_path = f"{uuid.uuid4()}{file_extension}"

    # Determine content type
    content_type = file.content_type
    if file_path.endswith('.ipynb') and (not content_type or content_type == 'application/octet-stream'):
        content_type = 'application/x-ipynb+json'

    # Upload the file
    # file.read() returns bytes
    file_data = file.read()

    # Compress images if they are too large
    if file.content_type and 'image' in file.content_type:
        file_data = compress_image(file_data)
        content_type = 'image/webp'

    supabase.storage.from_(folder).upload(
        path=file_path,
        file=file_data,
        file_options={"content-type": content_type}
    )

    # Get public URL
    public_url = supabase.storage.from_(folder).get_public_url(file_path)
    return public_url, file_path
