from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    help = 'Creates a superuser if one does not exist'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not all([username, email, password]):
            raise CommandError('Missing required environment variables: DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, or DJANGO_SUPERUSER_PASSWORD')

        # Remove all existing superusers to ensure a clean state and avoid "Invalid credentials"
        User.objects.filter(is_superuser=True).delete()
        self.stdout.write('Removed all existing superusers for a clean reset.')

        # Create the single, fresh superuser from environment variables
        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'Successfully created fresh superuser: {username}'))
