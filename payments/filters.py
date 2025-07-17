import django_filters
from .models import Payment
from django.utils import timezone

class PaymentFilter(django_filters.FilterSet):
    date_paid = django_filters.DateFromToRangeFilter()
    amount = django_filters.RangeFilter()
    min_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    is_verified = django_filters.BooleanFilter()

    class Meta:
        model = Payment
        fields = {
            'farmer': ['exact'],
            'payment_type': ['exact'],
            'method': ['exact'],
        }