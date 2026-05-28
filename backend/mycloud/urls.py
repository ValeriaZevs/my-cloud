import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from storage.views import AdminToggleAdminView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('storage.urls')), 
    path('api/admin/users/<int:pk>/toggle_admin/', AdminToggleAdminView.as_view()),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r'^(?P<path>.*\.(?:js|css|ico|png|jpg|jpeg|svg|gif|map))$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'frontend_build')}),
]

urlpatterns += [
    re_path(r'^(?!api|admin|media).*$', TemplateView.as_view(template_name='index.html')),
]