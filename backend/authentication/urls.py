from django.urls import path

from .views import (
    UserMeView,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    UserRegistrationView,
)

urlpatterns = [
    path(
        "auth/token/",
        CookieTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "auth/refresh/",
        CookieTokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
            "auth/me/",
            UserMeView.as_view(),
            name="user_me",
        ),


    path(
        "auth/register/",
        UserRegistrationView.as_view(),
        name="register",
    ),
    path(
        "auth/logout/",
        LogoutView.as_view(),
        name="logout",
    ),
]
