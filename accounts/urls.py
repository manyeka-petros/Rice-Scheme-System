from django.urls import path
from .views import (
    RegisterAPIView, LoginAPIView, UserProfileAPIView,
    UserListAPIView, UserDetailAPIView, FilteredSectionAPIView
)

urlpatterns = [
    path("register/", RegisterAPIView.as_view()),
    path("login/", LoginAPIView.as_view()),
    path("profile/", UserProfileAPIView.as_view()),
    path("users/", UserListAPIView.as_view()),
    path("users/<int:pk>/", UserDetailAPIView.as_view()),
    path("filtered-sections/", FilteredSectionAPIView.as_view()),  # ✅ new endpoint
]
