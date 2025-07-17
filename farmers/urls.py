from django.urls import path
from .views import (
    LocationAPIView,
    BlockAPIView,
    SectionAPIView,
    FarmerAPIView,
    DashboardStatsAPIView,
   
)

urlpatterns = [
    path('locations/', LocationAPIView.as_view(), name='location-list'),
    path('blocks/', BlockAPIView.as_view(), name='block-list'),
    path('sections/', SectionAPIView.as_view(), name='section-list'),
    path('farmers/', FarmerAPIView.as_view(), name='farmer-list'),
    path('dashboard/stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    
]
