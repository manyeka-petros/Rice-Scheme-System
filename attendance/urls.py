from django.urls import path
from .views import (
    AttendanceAPIView,
    BlockAttendanceView,
    AttendanceStatsView,
    PenaltyResetView,
)

urlpatterns = [
    # ✅ Main CRUD endpoint for attendance (GET, POST)
    path('', AttendanceAPIView.as_view(), name='attendance-list-create'),

    # ✅ View attendance for a specific block (with optional today filter)
    path('block/<int:block_id>/', BlockAttendanceView.as_view(), name='block-attendance'),

    # ✅ Analytics - Stats by block/status (present, absent, late, etc.)
    path('stats/', AttendanceStatsView.as_view(), name='attendance-stats'),

    # ✅ Reset penalty points for a specific farmer (Admin only)
    path('penalties/reset/<int:farmer_id>/', PenaltyResetView.as_view(), name='reset-penalties'),
]
