from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q, Sum, F, ExpressionWrapper, DecimalField
from .models import Location, Block, Section, Farmer
from .serializers import (
    LocationSerializer, BlockSerializer,
    SectionSerializer, FarmerSerializer
)
from attendance.models import Attendance
from payments.models import Payment
import logging

logger = logging.getLogger(__name__)

class IsAdminOrSecretary(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role in ('admin', 'secretary'))

class LocationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            locations = Location.objects.all()
            serializer = LocationSerializer(locations, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving locations: {e}")
            return Response({"error": "Failed to retrieve locations"}, status=500)

    @transaction.atomic
    def post(self, request):
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=201)
            except Exception as e:
                logger.error(f"Error saving location: {e}")
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

class BlockAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            blocks = Block.objects.all()
            serializer = BlockSerializer(blocks, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving blocks: {e}")
            return Response({"error": "Failed to retrieve blocks"}, status=500)

    @transaction.atomic
    def post(self, request):
        serializer = BlockSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=201)
            except Exception as e:
                logger.error(f"Error saving block: {e}")
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

class SectionAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            queryset = Section.objects.select_related('block')
            block_id = request.query_params.get('block_id')
            if block_id:
                queryset = queryset.filter(block_id=block_id)
            serializer = SectionSerializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving sections: {e}")
            return Response({"error": "Failed to retrieve sections"}, status=500)

    @transaction.atomic
    def post(self, request):
        serializer = SectionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=201)
            except Exception as e:
                logger.error(f"Error saving section: {e}")
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

class FarmerAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdminOrSecretary()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        try:
            queryset = Farmer.objects.select_related('location', 'block', 'section')
            block_id = request.query_params.get('block') or request.query_params.get('block_id')
            section_id = request.query_params.get('section_id')
            location_id = request.query_params.get('location_id')
            search = request.query_params.get('search')

            if block_id:
                queryset = queryset.filter(block_id=block_id)
            if section_id:
                queryset = queryset.filter(section_id=section_id)
            if location_id:
                queryset = queryset.filter(location_id=location_id)
            if search:
                queryset = queryset.filter(
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search) |
                    Q(phone_number__icontains=search) |
                    Q(registration_number__icontains=search)
                )

            paginator = PageNumberPagination()
            paginator.page_size = 10
            paginated_qs = paginator.paginate_queryset(queryset, request)
            serializer = FarmerSerializer(paginated_qs, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            logger.error(f"Error retrieving farmers: {e}")
            return Response({"error": "Failed to retrieve farmers"}, status=500)

    @transaction.atomic
    def post(self, request):
        serializer = FarmerSerializer(data=request.data)
        if serializer.is_valid():
            try:
                farmer = serializer.save()
                return Response(FarmerSerializer(farmer).data, status=201)
            except Exception as e:
                logger.error(f"Error saving farmer: {e}")
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

    @transaction.atomic
    def put(self, request, pk):
        farmer = get_object_or_404(Farmer, pk=pk)
        serializer = FarmerSerializer(farmer, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                updated_farmer = serializer.save()
                return Response(FarmerSerializer(updated_farmer).data)
            except Exception as e:
                logger.error(f"Error updating farmer: {e}")
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            farmer = get_object_or_404(Farmer, pk=pk)
            farmer.delete()
            return Response({"message": "Farmer deleted."}, status=204)
        except Exception as e:
            logger.error(f"Error deleting farmer: {e}")
            return Response({"error": str(e)}, status=500)

class DashboardStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_farmers = Farmer.objects.filter(is_active=True).count()

        present_count = Attendance.objects.filter(status='present').count()
        possible = total_farmers * 4
        attendance_rate = (present_count / possible * 100) if possible else 0
        attendance_rate = round(attendance_rate, 1)

        fines_collected = Payment.objects.filter(payment_type='fine').aggregate(
            total=Sum('amount')
        )['total'] or 0

        plots_qs = Farmer.objects.filter(is_active=True).values(
            'block__name', 'section__name'
        ).annotate(
            total_plots=Sum('number_of_plots')
        ).order_by('block__name', 'section__name')

        plots_summary = [
            {
                'block__name': p['block__name'],
                'section__name': p['section__name'],
                'total_plots': p['total_plots']
            }
            for p in plots_qs
        ]

        paid_annotation = Sum('payments__amount')
        farmers_qs = Farmer.objects.filter(is_active=True).annotate(
            paid=paid_annotation
        ).annotate(
            outstanding=ExpressionWrapper(
                F('total_amount') - F('paid'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        ).filter(outstanding__gt=0).order_by('-outstanding')[:5]

        top_unpaid = [
            {
                'id': f.id,
                'name': f"{f.first_name} {f.last_name}",
                'block': f.block.name,
                'section': f.section.name,
                'paid': float(f.outstanding)
            }
            for f in farmers_qs
        ]

        data = {
            'total_farmers': total_farmers,
            'attendance_rate': attendance_rate,
            'fines_collected': float(fines_collected),
            'plots_summary': plots_summary,
            'top_unpaid': top_unpaid,
        }
        return Response(data)
