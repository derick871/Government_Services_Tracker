from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer
)

User = get_user_model()


# ============================================================
# JWT LOGIN SERIALIZER
# ============================================================

class CustomTokenObtainPairSerializer(
    TokenObtainPairSerializer
):
    """
    Authenticate users using email/password and
    add RBAC information to the JWT.
    """

    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        token["email"] = user.email
        token["role"] = user.role
        token["county_code"] = (
            user.county_code or "GLOBAL"
        )

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


# ============================================================
# REGISTRATION SERIALIZER
# ============================================================

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Handles public citizen registration.
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={
            "input_type": "password"
        }
    )

    password_confirm = serializers.CharField(
        write_only=True,
        style={
            "input_type": "password"
        }
    )

    class Meta:

        model = User

        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
            "phone_number",
            "county_code",
        ]

        read_only_fields = ["id"]

    # --------------------------------------------------------
    # EMAIL VALIDATION
    # --------------------------------------------------------

    def validate_email(self, value):

        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    # --------------------------------------------------------
    # PASSWORD VALIDATION
    # --------------------------------------------------------

    def validate(self, attrs):

        password = attrs.get("password")
        password_confirm = attrs.get(
            "password_confirm"
        )

        if password != password_confirm:
            raise serializers.ValidationError({
                "password_confirm":
                    "Passwords do not match."
            })

        return attrs

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    def create(self, validated_data):

        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        # Public registration always creates a citizen.
        validated_data["role"] = "CITIZEN"

        return User.objects.create_user(
            password=password,
            **validated_data
        )