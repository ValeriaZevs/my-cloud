from django.contrib import admin
from django.urls import path, include
from storage.views import AdminToggleAdminView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('storage.urls')), 
    path('api/admin/users/<int:pk>/toggle_admin/', AdminToggleAdminView.as_view()),
]