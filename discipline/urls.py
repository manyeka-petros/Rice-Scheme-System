from django.urls import path
from .views import (
    DisciplineListCreateAPIView,
    DisciplineDetailAPIView,
    CaseResolutionAPIView,
    CaseStatsAPIView,
)

urlpatterns = [
    path('', DisciplineListCreateAPIView.as_view(), name='discipline-list-create'),
    path('<int:pk>/', DisciplineDetailAPIView.as_view(), name='discipline-detail'),
    path('<int:pk>/resolve/', CaseResolutionAPIView.as_view(), name='case-resolve'),
    path('stats/', CaseStatsAPIView.as_view(), name='case-stats'),
]
