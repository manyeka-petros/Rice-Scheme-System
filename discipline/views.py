from django.db import models, transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from django.db.models import Count, Q

from rest_framework import status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView

from django_filters.rest_framework import DjangoFilterBackend

from .models import DisciplineCase
from .serializers import DisciplineCaseSerializer
from .filters import DisciplineCaseFilter


class DisciplineListCreateAPIView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DisciplineCaseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DisciplineCaseFilter
    search_fields = ['farmer__first_name', 'farmer__last_name', 'offence_type']
    ordering_fields = ['date_reported', 'severity', 'penalty_points']
    ordering = ['-date_reported']

    def get_queryset(self):
        queryset = DisciplineCase.objects.select_related(
            'farmer', 'block', 'section', 'reported_by', 'resolved_by'
        )
        if self.request.user.role == 'block_chair':
            queryset = queryset.filter(block__block_chair=self.request.user)
        return queryset

    def post(self, request):
        serializer = DisciplineCaseSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            with transaction.atomic():
                case = serializer.save()
                if case.status == 'resolved':
                    case.resolved_by = request.user
                    case.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DisciplineDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        case = get_object_or_404(
            DisciplineCase.objects.select_related(
                'farmer', 'block', 'section', 'reported_by', 'resolved_by'
            ),
            pk=pk
        )
        if self.request.user.role == 'block_chair' and case.block.block_chair != self.request.user:
            raise PermissionDenied("You can only access cases from your block")
        return case

    def get(self, request, pk):
        case = self.get_object(pk)
        serializer = DisciplineCaseSerializer(case)
        return Response(serializer.data)

    def put(self, request, pk):
        case = self.get_object(pk)
        serializer = DisciplineCaseSerializer(
            case, data=request.data, context={'request': request}, partial=True
        )
        if serializer.is_valid():
            updated_case = serializer.save()
            if updated_case.status == 'resolved' and not updated_case.resolved_by:
                updated_case.resolved_by = request.user
                updated_case.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        case = self.get_object(pk)
        case.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CaseResolutionAPIView(APIView):
    """
    Special endpoint to resolve a case and record action taken.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

    def post(self, request, pk):
        case = get_object_or_404(DisciplineCase, pk=pk)

        if not request.data.get('action_taken'):
            return Response(
                {"action_taken": "This field is required when resolving a case."},
                status=status.HTTP_400_BAD_REQUEST
            )

        case.status = 'resolved'
        case.action_taken = request.data['action_taken']
        case.resolved_by = request.user
        case.save()

        serializer = DisciplineCaseSerializer(case)
        return Response(serializer.data)


class CaseStatsAPIView(APIView):
    """
    Provides statistics for discipline cases.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        stats = DisciplineCase.objects.aggregate(
            total_cases=Count('id'),
            open_cases=Count('id', filter=Q(status='open')),
            resolved_cases=Count('id', filter=Q(status='resolved')),
            serious_cases=Count('id', filter=Q(severity='serious')),
        )
        return Response(stats)
