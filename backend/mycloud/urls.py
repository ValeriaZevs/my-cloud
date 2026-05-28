from django.contrib import admin
from django.urls import path, include
from storage.views import AdminToggleAdminView
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('storage.urls')), 
    path('api/admin/users/<int:pk>/toggle_admin/', AdminToggleAdminView.as_view()),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r'^(?!api/).*$', TemplateView.as_view(template_name='index.html')),
]