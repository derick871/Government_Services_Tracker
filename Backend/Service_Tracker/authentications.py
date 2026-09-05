from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


# ======================
# JWT Serializer
# ======================

class LoginSerializer(TokenObtainPairSerializer):
    """Customize JWT response."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["email"] = user.email
        token["role"] = user.role
        token["county_code"] = user.county_code or ""

        return token

    def validate(self, attrs):
        """Return tokens with user details."""

        data = super().validate(attrs)

        data["role"]= self.user.role

        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "role": self.user.role,
            "county_code": self.user.county_code,
        }

        return data


# ======================
# Login View
# ======================

class LoginView(TokenObtainPairView):
    """JWT login endpoint."""

    serializer_class = LoginSerializer