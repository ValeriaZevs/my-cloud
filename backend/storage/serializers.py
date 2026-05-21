from rest_framework import serializers
from .models import User, File
import re


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'is_staff', 'storage_path')
        read_only_fields = ('is_staff', 'storage_path', 'id')

    def validate_username(self, value):
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{3,19}$', value):
            raise serializers.ValidationError("Логин: только латиница и цифры, первый символ — буква, длина 4-20 символов.")
        return value

    def validate_password(self, value):
        if len(value) < 6 or not re.search(r'[A-Z]', value) or not re.search(r'\d', value) or not re.search(r'[^a-zA-Z0-9]', value):
            raise serializers.ValidationError("Пароль: минимум 6 символов, 1 заглавная, 1 цифра, 1 спецсимвол.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'original_name', 'size', 'upload_date', 'comment', 'share_hash')
        read_only_fields = ('id', 'size', 'upload_date', 'share_hash')

class UserAdminSerializer(serializers.ModelSerializer):
    files_count = serializers.IntegerField(read_only=True)
    total_size = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'files_count', 'total_size')