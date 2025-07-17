from django.db.models import Count, Q
from datetime import date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import Attendance
from .serializers import AttendanceSerializer
from farmers.models import Block, Section


class AttendanceAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        block_id = request.query_params.get('block')
        section_id = request.query_params.get('section')
        status_filter = request.query_params.get('status')

        if user.role == 'admin':
            queryset = Attendance.objects.all()
        elif user.role == 'block_chair':
            if not user.block or not user.section:
                return Response(
                    {"error": "Block Chair has no block or section assigned."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            queryset = Attendance.objects.filter(block=user.block, section=user.section)
        else:
            print(f"Access denied for role: {user.role}")
            return Response(
                {"error": "You don't have permission to view attendance records."},
                status=status.HTTP_403_FORBIDDEN
            )

        if block_id:
            queryset = queryset.filter(block_id=block_id)
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        print("Fetching attendance with filters:", {
            "block": block_id,
            "section": section_id,
            "status": status_filter,
            "user": user.username,
            "results_count": queryset.count(),
        })

        serializer = AttendanceSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        serializer = AttendanceSerializer(data=request.data)

        if serializer.is_valid():
            block = serializer.validated_data.get('block')
            section = serializer.validated_data.get('section')

            if user.role == 'block_chair':
                if not user.block or not user.section:
                    return Response(
                        {"error": "Block Chair must be assigned a block and section."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if block != user.block or section != user.section:
                    print(f"Unauthorized access attempt by {user.username}")
                    return Response(
                        {"error": "Block Chairs can only record attendance for their assigned block and section."},
                        status=status.HTTP_403_FORBIDDEN
                    )

            serializer.save(recorded_by=user)
            print(f"✅ Attendance saved successfully by {user.username}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print(f"❌ Attendance POST validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlockAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, block_id):
        user = request.user
        today_only = request.query_params.get('today', 'false').lower() == 'true'

        if user.role != 'block_chair':
            return Response(
                {"error": "Only block chairs can access this endpoint."},
                status=status.HTTP_403_FORBIDDEN
            )

        if not user.block or str(user.block.id) != str(block_id):
            return Response(
                {"error": "You can only access attendance from your assigned block."},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = Attendance.objects.filter(block_id=block_id)
        if today_only:
            queryset = queryset.filter(date=date.today())

        serializer = AttendanceSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AttendanceStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        block_id = request.query_params.get('block_id')

        if user.role == 'block_chair':
            if not user.block:
                return Response(
                    {"error": "No block assigned to this chair."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            block_id = user.block.id

        queryset = Attendance.objects.all()
        if block_id:
            queryset = queryset.filter(block_id=block_id)

        stats = queryset.aggregate(
            total=Count('id'),
            present=Count('id', filter=Q(status='present')),
            absent=Count('id', filter=Q(status='absent')),
            late=Count('id', filter=Q(status='late')),
            excused=Count('id', filter=Q(status='excused')),
        )

        return Response(stats, status=status.HTTP_200_OK)


class PenaltyResetView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, farmer_id):
        Attendance.objects.filter(farmer_id=farmer_id).update(penalty_points=0)
        print(f"♻️ Penalties reset for farmer ID: {farmer_id} by {request.user.username}")
        return Response(
            {"status": f"Penalties reset for farmer {farmer_id}."},
            status=status.HTTP_200_OK
        )
