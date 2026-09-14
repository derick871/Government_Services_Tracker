# from django.conf import settings
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication


# class LoginSerializer(TokenObtainPairSerializer):
#     """Customize JWT claims and response structure."""

#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)

#         # Add custom claims to token payload
#         token["email"] = user.email
#         token["role"] = user.role
#         token["county_code"] = user.county_code or ""

#         return token

#     def validate(self, attrs):
#         """Return standard tokens along with structured user details."""
#         data = super().validate(attrs)

#         data["role"] = self.user.role
#         data["user"] = {
#             "id": self.user.id,
#             "email": self.user.email,
#             "first_name": self.user.first_name,
#             "last_name": self.user.last_name,
#             "role": self.user.role,
#             "county_code": self.user.county_code,
#         }

#         return data


# class LoginView(TokenObtainPairView):
#     """
#     JWT login endpoint that issues tokens and sets them 
#     securely inside HttpOnly cookies.
#     """

#     serializer_class = LoginSerializer

#     def finalize_response(self, request, response, *args, **kwargs):
#         if response.status_code == 200 and "access" in response.data:
#             access = response.data["access"]
#             refresh = response.data.get("refresh")

#             # Set Access Token Cookie (15 Minutes)
#             response.set_cookie(
#                 key="access_token",
#                 value=access,
#                 httponly=True,
#                 secure=not settings.DEBUG,
#                 samesite="Lax",
#                 max_age=60 * 15,
#                 path="/",
#             )

#             # Set Refresh Token Cookie (7 Days)
#             if refresh:
#                 response.set_cookie(
#                     key="refresh_token",
#                     value=refresh,
#                     httponly=True,
#                     secure=not settings.DEBUG,
#                     samesite="Lax",
#                     max_age=60 * 60 * 24 * 7,
#                     path="/api/",
#                 )

#         return super().finalize_response(request, response, *args, **kwargs)


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class to pull the JWT access token
    from HttpOnly cookies, with a fallback to the Authorization header.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = None

        if header is not None:
            raw_token = self.get_raw_token(header)
        
        # Fallback to reading the token from the HttpOnly cookie if header is empty
        if raw_token is None:
            raw_token = request.COOKIES.get("access_token")

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token