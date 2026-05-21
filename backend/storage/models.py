import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    storage_path = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.storage_path:
            self.storage_path = f"user_{self.username}_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    original_name = models.CharField(max_length=255)
    internal_name = models.CharField(max_length=255, unique=True)
    size = models.BigIntegerField()
    comment = models.TextField(blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    last_download_date = models.DateTimeField(blank=True, null=True)

    share_hash = models.CharField(max_length=64, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.share_hash:
            self.share_hash = uuid.uuid4().hex
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.original_name} ({self.user.username})"