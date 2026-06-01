import os
import uuid
from django.conf import settings
from django.utils import timezone
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count, Sum

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import File
from .serializers import UserSerializer, FileSerializer
from urllib.parse import quote

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Успешный вход",
                "is_staff": user.is_staff,
                "username": user.username,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)

        return Response({"error": "Неверный логин или пароль"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Вы успешно вышли"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Недействительный токен"}, status=status.HTTP_400_BAD_REQUEST)


class FileListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')

        if request.user.is_staff and user_id:
            files = File.objects.filter(user_id=user_id)
        else:
            files = File.objects.filter(user=request.user)

        serializer = FileSerializer(files, many=True)
        return Response(serializer.data)

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        comment = request.data.get('comment', '')

        if not uploaded_file:
            return Response({"error": "Файл не предоставлен"}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(uploaded_file.name)[1]
        internal_name = f"{uuid.uuid4().hex}{ext}"

        user_folder = os.path.join(settings.MEDIA_ROOT, request.user.storage_path)
        os.makedirs(user_folder, exist_ok=True)

        file_path = os.path.join(user_folder, internal_name)

        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)

        file_record = File.objects.create(
            user=request.user,
            original_name=uploaded_file.name,
            internal_name=internal_name,
            size=uploaded_file.size,
            comment=comment
        )

        serializer = FileSerializer(file_record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.is_staff:
            file_obj = get_object_or_404(File, pk=pk)
        else:
            file_obj = get_object_or_404(File, pk=pk, user=request.user)

        if 'original_name' in request.data:
            file_obj.original_name = request.data['original_name']
        if 'comment' in request.data:
            file_obj.comment = request.data['comment']

        file_obj.save()
        return Response(FileSerializer(file_obj).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        if request.user.is_staff:
            file_obj = get_object_or_404(File, pk=pk)
        else:
            file_obj = get_object_or_404(File, pk=pk, user=request.user)

        file_path = os.path.join(settings.MEDIA_ROOT, file_obj.user.storage_path, file_obj.internal_name)

        if os.path.exists(file_path):
            os.remove(file_path)

        file_obj.delete()
        return Response({"message": "Файл успешно удален"}, status=status.HTTP_204_NO_CONTENT)


class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.is_staff:
            file_obj = get_object_or_404(File, pk=pk)
        else:
            file_obj = get_object_or_404(File, pk=pk, user=request.user)

        file_path = os.path.join(settings.MEDIA_ROOT, file_obj.user.storage_path, file_obj.internal_name)

        if os.path.exists(file_path):
            file_obj.last_download_date = timezone.now()
            file_obj.save()

            response = FileResponse(open(file_path, 'rb'))
            encoded_filename = quote(file_obj.original_name)
            response['Content-Disposition'] = f"attachment; filename*=UTF-8''{encoded_filename}"
            return response

        return Response({"error": "Файл не найден на сервере"}, status=status.HTTP_404_NOT_FOUND)


class FileShareDownloadView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, share_hash):
        file_obj = get_object_or_404(File, share_hash=share_hash)
        file_path = os.path.join(settings.MEDIA_ROOT, file_obj.user.storage_path, file_obj.internal_name)

        if os.path.exists(file_path):
            file_obj.last_download_date = timezone.now()
            file_obj.save()

            response = FileResponse(open(file_path, 'rb'))
            encoded_filename = quote(file_obj.original_name)
            response['Content-Disposition'] = f"attachment; filename*=UTF-8''{encoded_filename}"
            return response

        return Response({"error": "Файл не найден"}, status=status.HTTP_404_NOT_FOUND)


class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.annotate(
            file_count=Count('files'),
            total_size=Sum('files__size')
        )
        data = []
        for u in users:
            data.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'is_staff': u.is_staff,
                'file_count': u.file_count or 0,
                'total_size': u.total_size or 0,
            })
        return Response(data)


class AdminUserDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        if user == request.user:
            return Response({"error": "Нельзя удалить самого себя"}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_staff:
            return Response({"error": "Нельзя удалить администратора"}, status=status.HTTP_403_FORBIDDEN)

        user.delete()
        return Response({"message": "Пользователь удален"}, status=status.HTTP_204_NO_CONTENT)


class FileShareLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.is_staff:
            file_obj = get_object_or_404(File, pk=pk)
        else:
            file_obj = get_object_or_404(File, pk=pk, user=request.user)

        if not getattr(file_obj, 'share_hash', None):
            file_obj.share_hash = uuid.uuid4().hex
            file_obj.save()

        relative_url = f"/api/files/share/{file_obj.share_hash}/"
        share_url = request.build_absolute_uri(relative_url)

        return Response({
            "url": share_url,
            "share_hash": file_obj.share_hash
        }, status=status.HTTP_200_OK)


class AdminToggleAdminView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        if user == request.user:
            return Response({"error": "Нельзя изменить права самому себе"}, status=status.HTTP_400_BAD_REQUEST)

        user.is_staff = not user.is_staff
        user.save()
        return Response({
            "message": f"Статус администратора для пользователя {user.username} изменен",
            "is_staff": user.is_staff
        }, status=status.HTTP_200_OK)