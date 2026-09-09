import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from content.models import BlogCellOutput

outs = BlogCellOutput.objects.filter(text_output__contains='Figure size').first()
if outs:
    print(f"Found output record:")
    print(f"Text: {outs.text_output}")
    print(f"Image: {outs.image_output}")
else:
    print("No records found with 'Figure size' in text_output")
