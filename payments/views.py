# payments/views.py
from datetime import timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count
from rest_framework import status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Payment
from .serializers import PaymentSerializer
from .filters import PaymentFilter


class PaymentListCreateAPIView(APIView):
    """
    GET: list & filter payments  
    POST: create a new payment
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PaymentFilter
    search_fields = ['farmer__first_name', 'farmer__last_name', 'reference_code']
    ordering_fields = ['date_paid', 'amount', 'timestamp']
    ordering = ['-date_paid']

    def get(self, request):
        # Base queryset
        qs = Payment.objects.select_related('farmer', 'recorded_by', 'verified_by')
        print("🔍 Base payments queryset:", qs.query)

        # Role-based scoping
        if request.user.role == 'block_chair':
            qs = qs.filter(farmer__block__block_chair=request.user)
            print(f"🔒 Block-chair {request.user.username} sees only their block:", request.user.block)

        # Apply DjangoFilterBackend
        filter_backend = DjangoFilterBackend()
        qs = filter_backend.filter_queryset(request, qs, self)
        print("⚙️ After filters:", qs.query)

        # Apply search
        for backend in [filters.SearchFilter(), filters.OrderingFilter()]:
            qs = backend.filter_queryset(request, qs, self)
        print("🔄 After search+ordering:", qs.query)

        # Serialize & return
        data = PaymentSerializer(qs, many=True, context={'request': request}).data
        print(f"✅ Returning {len(data)} payments")
        return Response(data)

    def post(self, request):
        print("📝 POST payload:", request.data)
        serializer = PaymentSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            print("❌ Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Save with recorded_by
        payment = serializer.save(recorded_by=request.user)
        print(f"💾 Saved payment #{payment.id} by {request.user.username}")

        return Response(
            PaymentSerializer(payment, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class PaymentDetailAPIView(APIView):
    """
    GET, PUT, DELETE on a single payment
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        payment = get_object_or_404(Payment, pk=pk)
        # Block-chair check
        if user.role == 'block_chair' and payment.farmer.block.block_chair != user:
            print(f"🚫 {user.username} tried to access payment #{pk} outside their block")
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Cannot access payments from other blocks")
        return payment

    def get(self, request, pk):
        payment = self.get_object(pk, request.user)
        print(f"📖 Retrieved payment #{payment.id}")
        return Response(PaymentSerializer(payment, context={'request': request}).data)

    def put(self, request, pk):
        payment = self.get_object(pk, request.user)
        print(f"✏️ PUT update for payment #{payment.id} payload:", request.data)
        serializer = PaymentSerializer(payment, data=request.data, context={'request': request}, partial=True)
        if not serializer.is_valid():
            print("❌ Validation errors on update:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        updated = serializer.save()
        print(f"✔️ Updated payment #{updated.id}")
        return Response(PaymentSerializer(updated, context={'request': request}).data)

    def delete(self, request, pk):
        payment = self.get_object(pk, request.user)
        payment.delete()
        print(f"🗑️ Deleted payment #{pk}")
        return Response(status=status.HTTP_204_NO_CONTENT)


class VerifyPaymentAPIView(APIView):
    """
    POST /api/payments/{pk}/verify/ → mark as verified
    """
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
    required_permissions = ['payments.verify_payment']

    def post(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk)
        if payment.is_verified:
            print(f"⚠️ Payment #{pk} already verified")
            return Response({"detail": "Already verified"}, status=status.HTTP_400_BAD_REQUEST)

        payment.is_verified = True
        payment.verified_by = request.user
        payment.save()
        print(f"🔓 Payment #{pk} verified by {request.user.username}")
        return Response(PaymentSerializer(payment, context={'request': request}).data)


class PaymentStatsAPIView(APIView):
    """
    GET /api/payments/stats/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        last_week = today - timedelta(days=7)
        last_month = today - timedelta(days=30)

        qs = Payment.objects.all()
        if request.user.role == 'block_chair':
            qs = qs.filter(farmer__block__block_chair=request.user)
            print(f"📊 Stats limited to block {request.user.block}")

        stats = {
            "total_payments": qs.count(),
            "total_amount": qs.aggregate(Sum('amount'))['amount__sum'] or 0,
            "today": qs.filter(date_paid=today).aggregate(Count('id'), Sum('amount')),
            "last_week": qs.filter(date_paid__gte=last_week).aggregate(Count('id'), Sum('amount')),
            "last_month": qs.filter(date_paid__gte=last_month).aggregate(Count('id'), Sum('amount')),
            "by_type": list(qs.values('payment_type').annotate(count=Count('id'), amount=Sum('amount'))),
            "verification_stats": {
                "verified": qs.filter(is_verified=True).count(),
                "unverified": qs.filter(is_verified=False).count()
            }
        }

        print("📈 Payment stats:", stats)
        return Response(stats)
