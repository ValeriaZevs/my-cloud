from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_superuser(apps, schema_editor):
    User = apps.get_model('storage', 'User')
    
    if not User.objects.filter(username='admin').exists():
        User.objects.create(
            username='admin',
            email='admin@mycloud.ru',
            password=make_password('Admin_12345!'),
            is_staff=True,
            is_superuser=True
        )

class Migration(migrations.Migration):
    dependencies = [
        ('storage', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]