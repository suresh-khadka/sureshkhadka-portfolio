import json
from django.core.management.base import BaseCommand
from content.models import Blog, BlogSection, BlogCell, BlogCellOutput, Notebook
from content.utils import upload_file_to_supabase
from django.io import StringIO
from django.core.files.base import ContentFile

class Command(BaseCommand):
    help = 'Migrates existing BlogCell data to .ipynb files in Supabase Storage'

    def handle(self, *args, **options):
        blogs = Blog.objects.all()
        total_blogs = blogs.count()
        total_sections = 0
        total_notebooks = 0
        total_cells = 0
        errors = 0

        self.stdout.write(f"Starting migration of {total_blogs} blogs...")

        for blog in blogs:
            sections = BlogSection.objects.filter(blog=blog).order_by('order')
            for section in sections:
                total_sections += 1
                cells = BlogCell.objects.filter(section=section).order_by('order')

                if not cells.exists():
                    continue

                # Aggregate cells into a single notebook
                ipynb_cells = []
                for cell in cells:
                    total_cells += 1
                    if cell.cell_type == 'markdown':
                        ipynb_cells.append({
                            "cell_type": "markdown",
                            "metadata": {},
                            "source": [cell.content + "\n"]
                        })
                    elif cell.cell_type == 'code':
                        outputs = []
                        try:
                            output = cell.output
                            if output:
                                if output.text_output:
                                    outputs.append({"output_type": "stream", "text": output.text_output + "\n"})
                                if output.error_output:
                                    outputs.append({"output_type": "stream", "text": output.error_output + "\n"})
                                if output.image_output:
                                    # Since it's a URL, we can't easily put it in the notebook JSON as base64 without downloading.
                                    # We'll add a markdown cell with the image instead for visibility.
                                    ipynb_cells.append({
                                        "cell_type": "markdown",
                                        "metadata": {},
                                        "source": [f"![Output]({output.image_output})\n"]
                                    })
                        except Exception:
                            pass

                        ipynb_cells.append({
                            "cell_type": "code",
                            "execution_count": None,
                            "metadata": {},
                            "outputs": outputs,
                            "source": [cell.content + "\n"]
                        })

                notebook_json = {
                    "cells": ipynb_cells,
                    "metadata": {},
                    "nbformat": 4,
                    "nbformat_minor": 4
                }

                try:
                    # Convert JSON to a file-like object
                    json_str = json.dumps(notebook_json, indent=1)
                    file_content = ContentFile(json_str.encode('utf-8'), name=f"{section.title}.ipynb")

                    # Upload to Supabase
                    # Use a predictable path for migration
                    custom_path = f"blogs/{blog.id}/notebooks/migrated_{section.id}.ipynb"
                    public_url, stored_path = upload_file_to_supabase(file_content, custom_path=custom_path)

                    # Create Notebook record
                    Notebook.objects.create(
                        section=section,
                        title=f"Migrated: {section.title}",
                        storage_path=stored_path,
                        order=0 # Default order for migrated notebooks
                    )
                    total_notebooks += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error migrating section {section.id}: {e}"))
                    errors += 1

        self.stdout.write(self.style.SUCCESS(
            f"Migration completed!\n"
            f"Blogs processed: {total_blogs}\n"
            f"Sections processed: {total_sections}\n"
            f"Notebooks created: {total_notebooks}\n"
            f"Cells converted: {total_cells}\n"
            f"Errors: {errors}"
        ))
