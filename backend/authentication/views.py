from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAuthenticatedUser

from .serializers import UserRegistrationSerializer


User = get_user_model()


class LoginSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["email"] = user.email
        token["role"] = user.role
        token["county_code"] = user.county_code or "GLOBAL"

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "role": self.user.role,
            "county_code": self.user.county_code,
        }

        return data


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data["access"]
        refresh = serializer.validated_data["refresh"]

        response = Response(
            {
                "user": serializer.validated_data["user"],
            },
            status=status.HTTP_200_OK,
        )

        is_production = not settings.DEBUG

        response.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=is_production,
            samesite="None" if is_production else "Lax",
            max_age=60 * 60,
            path="/",
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=is_production,
            samesite="None" if is_production else "Lax",
            max_age=60 * 60 * 24 * 7,
            path="/",
        )

        return response


class CookieTokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token)

            access = str(refresh.access_token)

            response = Response(
                {"detail": "Token refreshed."},
                status=status.HTTP_200_OK,
            )

            is_production = not settings.DEBUG

            response.set_cookie(
                key="access_token",
                value=access,
                httponly=True,
                secure=is_production,
                samesite="None" if is_production else "Lax",
                max_age=60 * 60,
                path="/",
            )

            return response

        except Exception:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response(
            {"detail": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )

        response.delete_cookie(
            "access_token",
            path="/",
            samesite="None",
        )

        response.delete_cookie(
            "refresh_token",
            path="/",
            samesite="None",
        )

        return response


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class UserMeView(APIView):
    """Return current authenticated user details and role profile."""
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "role": getattr(user, "role", "CITIZEN"),
            "county_code": getattr(user, "county_code", None),
        })