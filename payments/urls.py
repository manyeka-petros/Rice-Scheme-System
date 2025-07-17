from django.urls import path
from .views import (
    PaymentListCreateAPIView,
    PaymentDetailAPIView,
    VerifyPaymentAPIView,
    PaymentStatsAPIView,
)

urlpatterns = [
    path('', PaymentListCreateAPIView.as_view(), name='payment-list-create'),
    path('<int:pk>/', PaymentDetailAPIView.as_view(), name='payment-detail'),
    path('<int:pk>/verify/', VerifyPaymentAPIView.as_view(), name='payment-verify'),
    path('stats/', PaymentStatsAPIView.as_view(), name='payment-stats'),
]
