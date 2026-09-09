import json
import base64
import uuid
import io
from django.core.management.base import BaseCommand
from content.models import Blog, Notebook, BlogSection, BlogCell, BlogCellOutput
from content.utils import get_supabase_client, upload_file_to_supabase

class Command(BaseCommand):
    help = 'Backfills BlogCell and BlogCellOutput from existing Notebook .ipynb files'

    def handle(self, *args, **options):
        supabase = get_supabase_client()
        notebooks = Notebook.objects.all()
        self.stdout.write(f"Processing {notebooks.count()} notebooks...")

        for notebook in notebooks:
            self.stdout.write(f"Processing notebook: {notebook.title}...")

            # 1. Download the notebook JSON
            bucket = 'portfolio-assets'
            try:
                # Download file bytes from Supabase
                res = supabase.storage.from_(bucket).download(notebook.storage_path)
                # res is bytes
                data = json.loads(res.decode('utf-8'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to download {notebook.title}: {e}"))
                continue

            if 'cells' not in data:
                self.stdout.write(self.style.WARNING(f"No cells found in {notebook.title}"))
                continue

            section = notebook.section
            # Clear existing cells for this section to avoid duplicates during backfill
            BlogCell.objects.filter(section=section).delete()

            for idx, cell in enumerate(data['cells']):
                cell_type = cell.get('cell_type', 'markdown')
                source = cell.get('source', [])
                if isinstance(source, list):
                    source = "".join(source)

                # Create the cell
                blog_cell = BlogCell.objects.create(
                    section=section,
                    cell_type=cell_type,
                    content=source,
                    language=cell.get('metadata', {}).get('language', 'python') if cell_type == 'code' else 'markdown',
                    order=idx
                )

                # Process outputs
                outputs = cell.get('outputs', [])
                for output in outputs:
                    # Jupyter outputs can be 'stream', 'execute_result', 'display_data', 'error'
                    out_type = output.get('output_type')
                    data_dict = output.get('data', {})

                    text_out = None
                    error_out = None
                    image_out = None

                    if out_type == 'stream':
                        text_out = "".join(output.get('text', []))
                    elif out_type == 'error':
                        error_out = output.get('ename', '') + ": " + output.get('evalue', '')
                    elif out_type in ('display_data', 'execute_result'):
                        # Check for image
                        image_mime = None
                        for mime in ['image/png', 'image/jpeg', 'image/svg+xml']:
                            if mime in data_dict:
                                image_mime = mime
                                break

                        if image_mime:
                            # Base64 decode and upload
                            base64_data = data_dict[image_mime]
                            try:
                                # Handle data:image/png;base64, prefix if present
                                if ',' in base64_data:
                                    base64_data = base64_data.split(',')[1]

                                img_bytes = base64.b64decode(base64_data)

                                # Create a file-like object for upload_file_to_supabase
                                from django.core.files.base import ContentFile
                                file_obj = ContentFile(img_bytes, name=f"output_{uuid.uuid4()}.png")

                                # Path: blogs/{blog_id}/notebooks/{notebook_id}/outputs/{uuid}.png
                                blog_id = section.blog.id
                                custom_path = f"blogs/{blog_id}/notebooks/{notebook.id}/outputs/{uuid.uuid4()}.png"

                                public_url, _ = upload_file_to_supabase(file_obj, custom_path=custom_path)
                                image_out = public_url
                            except Exception as e:
                                self.stdout.write(self.style.ERROR(f"Image upload failed: {e}"))

                        # Also capture text/html or text/plain as text_output
                        if 'text/plain' in data_dict:
                            text_out = "\n".join(data_dict['text/plain']) if isinstance(data_dict['text/plain'], list) else data_dict['text/plain']
                        elif 'text/html' in data_dict:
                            text_out = data_dict['text/html']

                    if text_out or error_out or image_out:
                        BlogCellOutput.objects.create(
                            cell=blog_cell,
                            text_output=text_out,
                            error_output=error_out,
                            image_output=image_out
                        )

        self.stdout.write(self.style.SUCCESS("Backfill completed successfully!"))
