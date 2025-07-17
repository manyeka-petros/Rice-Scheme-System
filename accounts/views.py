from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404

from .models import CustomUser
from .serializers import (
    RegisterUserSerializer,
    LoginSerializer,
    UserProfileSerializer,
    UserUpdateSerializer
)

from farmers.models import Block, Section  # From farmers app


class RegisterAPIView(APIView):
    def post(self, request):
        print("🔧 Register request received:", request.data)
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            print("✅ Registration successful for user:", user.username)
            return Response(
                {'message': 'Registration successful. Waiting for admin approval.'},
                status=status.HTTP_201_CREATED
            )
        print("❌ Registration errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    def post(self, request):
        print("🔐 Login attempt for:", request.data.get("username"))
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            print(f"✅ Login successful: {user.username}, Token issued.")
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_approved': user.is_approved,
                    'block': user.block_id,
                    'section': user.section_id
                }
            })
        print("❌ Login failed:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(f"👤 Profile requested for: {request.user.username}")
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


class UserListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(f"📋 Admin user list requested by: {request.user.username}")
        users = CustomUser.objects.all().order_by('-date_joined')
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)


class UserDetailAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get_user(self, pk):
        print(f"🔍 Fetching user with ID: {pk}")
        return get_object_or_404(CustomUser, pk=pk)

    def get(self, request, pk):
        user = self.get_user(pk)
        print(f"📄 Detail view for user: {user.username}")
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def patch(self, request, pk):
        user = self.get_user(pk)
        data = request.data.copy()
        role = data.get("role", user.role)

        print(f"✏️ Admin updating user: {user.username} with data: {data}")

        if role == "block_chair":
            block_id = data.get("block")
            section_id = data.get("section")

            if not block_id or not section_id:
                return Response(
                    {"detail": "Block and section are required for block chairs."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                block = Block.objects.get(id=block_id)
                section = Section.objects.get(id=section_id)
                data["block"] = block.id
                data["section"] = section.id
            except (Block.DoesNotExist, Section.DoesNotExist):
                return Response(
                    {"detail": "Invalid block or section ID."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            data["block"] = None
            data["section"] = None

        serializer = UserUpdateSerializer(
            user,
            data=data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            print(f"✅ Update successful for user: {user.username}")
            return Response(serializer.data)
        print(f"❌ Update errors for user {user.username}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ Filter Sections by Block
class FilteredSectionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        block_id = request.query_params.get("block_id")
        if not block_id:
            return Response({"error": "block_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        sections = Section.objects.filter(block_id=block_id)
        section_data = [{"id": s.id, "name": s.name} for s in sections]
        return Response(section_data)
