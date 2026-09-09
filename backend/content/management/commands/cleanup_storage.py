import os
from django.core.management.base import BaseCommand
from content.models import Blog, Notebook
from content.utils import get_supabase_client, extract_path_from_url

class Command(BaseCommand):
    help = 'Find orphaned files in the portfolio-assets storage bucket'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Actually delete the orphaned files from storage instead of just listing them',
        )

    def handle(self, *args, **options):
        delete_mode = options['delete']
        bucket_name = 'portfolio-assets'
        supabase = get_supabase_client()


        self.stdout.write(self.style.SUCCESS(f"Scanning bucket '{bucket_name}' for orphaned files..."))

        # 1. List all objects in the bucket recursively
        all_storage_objects = []

        def list_recursive(path=''):
            # list() returns files and folders in the current path
            res = supabase.storage.from_(bucket_name).list(path=path)

            for item in res:
                full_path = f"{path}/{item['name']}".lstrip('/')
                if item.get('id') is None: # It's a folder (folders in Supabase storage usually have id=None)
                    list_recursive(full_path)
                else:
                    # It's a file
                    # We store the path and the size
                    all_storage_objects.append({
                        'path': full_path,
                        'size': item.get('metadata', {}).get('size', 0)
                    })

        try:
            list_recursive()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error listing bucket: {e}"))
            return

        # 2. Collect all referenced paths from the database
        referenced_paths = set()

        # Blog cover images
        blogs = Blog.objects.all()
        for blog in blogs:
            if blog.cover_image_url:
                path = extract_path_from_url(blog.cover_image_url)
                if path:
                    referenced_paths.add(path)

        # Notebook storage paths
        notebooks = Notebook.objects.all()
        for notebook in notebooks:
            if notebook.storage_path:
                referenced_paths.add(notebook.storage_path)

        # 3. Diff the lists
        orphaned_files = []
        for obj in all_storage_objects:
            if obj['path'] not in referenced_paths:
                orphaned_files.append(obj)

        if not orphaned_files:
            self.stdout.write(self.style.SUCCESS("No orphaned files found!"))
            return

        self.stdout.write(self.style.WARNING(f"Found {len(orphaned_files)} orphaned files:"))
        self.stdout.write("-" * 80)
        self.stdout.write(f"{'Path':<60} | {'Size (KB)':<15}")
        self.stdout.write("-" * 80)

        total_wasted_size = 0
        for file in orphaned_files:
            size_kb = file['size'] / 1024
            total_wasted_size += file['size']
            self.stdout.write(f"{file['path']:<60} | {size_kb:<15.2f}")

            if delete_mode:
                try:
                    supabase.storage.from_(bucket_name).remove([file['path']])
                    self.stdout.write(f"  -> Deleted: {file['path']}")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  -> Failed to delete {file['path']}: {e}"))

        self.stdout.write("-" * 80)
        self.stdout.write(self.style.SUCCESS(f"Total wasted space: {total_wasted_size / (1024*1024):.2f} MB"))
