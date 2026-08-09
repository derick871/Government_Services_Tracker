from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import (
    TokenObtainPairView
)

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
)


# ============================================================
# LOGIN
# ============================================================

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/token/

    Authenticate using email and password.
    """

    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


# ============================================================
# REGISTRATION
# ============================================================

class UserRegistrationView(generics.CreateAPIView):
    """
    POST /api/auth/register/

    Creates a new citizen account.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]