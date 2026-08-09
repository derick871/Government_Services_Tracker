"""
Root URL Configuration for drf_project.

This module establishes the top-level routing architecture for the application,
segregating administrative boundaries, core API endpoints, authentication mechanisms, 
and automated OpenAPI documentation schema views.
"""

from django.contrib import admin
from django.urls import include, path


urlpatterns = [

    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "api/",
        include("Service_Tracker.urls"),
    ),

    path(
        "api/auth/",
        include("authentication.urls"),
    )
]