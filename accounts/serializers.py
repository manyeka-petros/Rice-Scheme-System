from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser
from farmers.serializers import BlockSerializer, SectionSerializer


class RegisterUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'first_name', 'last_name', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # All new users are farmers by default, pending approval
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', ''),
            role='farmer',
            is_approved=False
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    block = BlockSerializer(read_only=True)
    section = SectionSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'first_name', 'last_name',
            'email', 'role', 'is_approved', 'block', 'section'
        )
        read_only_fields = ('username', 'is_approved')


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'first_name', 'last_name', 'email',
            'role', 'block', 'section', 'is_approved'
        )
        extra_kwargs = {
            'role': {'required': False},
            'block': {'required': False},
            'section': {'required': False}
        }

    def validate(self, data):
        request_user = self.context['request'].user

        # Ensure only authorized users can change roles and approval
        if 'role' in data or 'is_approved' in data:
            if not request_user.has_perm('users.can_assign_roles'):
                raise serializers.ValidationError(
                    "You don't have permission to change roles or approval status"
                )

        role = data.get('role') or self.instance.role

        # If assigning block_chair, make sure block and section are provided
        if role == 'block_chair':
            if not data.get('block') or not data.get('section'):
                raise serializers.ValidationError(
                    "Block and section are required for block chair role"
                )

        return data


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_approved:  # Only allow approved users to login
            return user
        raise serializers.ValidationError(
            "Invalid credentials or account not approved"
        )
