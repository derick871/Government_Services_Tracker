from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import (
    CountyNoticeListView,
    CountyNoticeByCountyView,
    ApplicationListCreateView,
    ApplicationDetailView,
    UpdateApplicationStatusView,
)
from .authentications import LoginView


app_name = "Service_Tracker"


urlpatterns = [

    # ======================
    # Authentication
    # ======================

    path(
        "auth/login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
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