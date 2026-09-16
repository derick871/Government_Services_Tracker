from django.urls import path

from .views import (
    # UserMeView,  
    CountyNoticeListView,
    CountyNoticeByCountyView,
    ApplicationListCreateView,
    ApplicationDetailView,
    UpdateApplicationStatusView,
)

app_name = "service_tracker"

urlpatterns = [
   
    # path(
    #     "auth/me/",
    #     UserMeView.as_view(),
    #     name="user_me",
    # ),

    # ======================
    # County Notices (Fixed to match frontend /api/county-notices/)
    # ======================
    path(
        "county-notices/",
        CountyNoticeListView.as_view(),
        name="notice_list",
    ),
    path(
        "county-notices/<str:county_id>/",
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
        "applications/<int:pk>/status/",
        UpdateApplicationStatusView.as_view(),
        name="application_status",
    ),
    path(
        "applications/<str:tracking_number>/",
        ApplicationDetailView.as_view(),
        name="application_detail",
    ),
]