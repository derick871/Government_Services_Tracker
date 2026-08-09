from django.urls import path

from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
)


urlpatterns = [

    path(
        "token/",
        CustomTokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),

    path(
        "register/",
        UserRegistrationView.as_view(),
        name="register"
    ),
]