from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CookieTokenObtainPairView,
    UserMeView,  
    CountyNoticeListView,
    CountyNoticeByCountyView,
    ApplicationListCreateView,
    ApplicationDetailView,
    UpdateApplicationStatusView,
)

app_name = "Service_Tracker"

urlpatterns = [
    # ======================
    # Authentication & User
    # ======================
    path(
        "auth/token/",
        CookieTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
        "auth/me/",
        UserMeView.as_view(),
        name="user_me",
    ),

    # ======================
    # County Notices
    # ======================
    path(
        "notices/",
        CountyNoticeListView.as_view(),
        name="notice_list",
    ),
    path(
        "notices/<str:county_id>/",
        CountyNoticeByCountyView.as_view(),
        name="notice_by_county",
    ),

    # ======================
    # Applications
    # ======================
    path(
        "applications/",
        ApplicationListCreateView.as_view(),
        name="application_list",
    ),
    path(
        "applications/<str:tracking_number>/",
        ApplicationDetailView.as_view(),
        name="application_detail",
    ),
    path(
        "applications/<int:pk>/status/",
        UpdateApplicationStatusView.as_view(),
        name="application_status",
    ),
]