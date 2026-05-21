import os

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, os.environ.get('MEDIA_ROOT_BASE', 'media/'))