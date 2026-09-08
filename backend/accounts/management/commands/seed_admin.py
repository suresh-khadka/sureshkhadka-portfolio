from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Seeds the single admin user for the portfolio'

    def handle(self, *args, **options):
        username = 'admin'
        email = 'admin@portfolio.com'
        password = 'adminpassword123' # In real life, this would come from an env var

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'Admin user "{username}" already exists.'))
            return

        user = User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'Successfully created admin user: {username}'))
