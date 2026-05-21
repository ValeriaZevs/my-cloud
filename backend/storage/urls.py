from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView,
    FileListCreateView, FileDetailView,
    FileDownloadView, FileShareDownloadView,
    AdminUserListView, AdminUserDeleteView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path('files/', FileListCreateView.as_view(), name='file-list-create'),
    path('files/<int:pk>/', FileDetailView.as_view(), name='file-detail'),
    path('files/<int:pk>/download/', FileDownloadView.as_view(), name='file-download'),

    path('share/<str:share_hash>/', FileShareDownloadView.as_view(), name='file-share'),

    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDeleteView.as_view(), name='admin-user-delete'),
]