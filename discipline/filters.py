import django_filters
from .models import DisciplineCase

class DisciplineCaseFilter(django_filters.FilterSet):
    date_reported = django_filters.DateFromToRangeFilter()
    date_incident = django_filters.DateFromToRangeFilter()
    penalty_points = django_filters.RangeFilter()
    
    class Meta:
        model = DisciplineCase
        fields = {
            'block': ['exact'],
            'section': ['exact'],
            'offence_type': ['exact'],
            'status': ['exact'],
            'severity': ['exact'],
            'reported_by': ['exact'],
        }