from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# ============================================================
# JWT LOGIN SERIALIZER
# ============================================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Authenticate users using email/password and inject custom 
    RBAC authorization context parameters into the JWT payload.
    """

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


# ============================================================
# REGISTRATION SERIALIZER
# ============================================================

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Validates and processes public citizen registration payloads.
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"}
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

    def validate_email(self, value):
        """Ensure email normalization and unique constraint checking."""
        email_normalized = value.lower().strip()
        if User.objects.filter(email=email_normalized).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email_normalized

    def validate(self, attrs):
        """Cross-field validation checking matching password contracts."""
        if attrs.get("password") != attrs.get("password_confirm"):
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })
        return attrs

    def create(self, validated_data):
        """Instantiate user profile cleanly via custom manager bindings."""
        validated_data.pop("password_confirm", None)
        password = validated_data.pop("password")
        
        # Enforce strict public default role context
        validated_data["role"] = User.Role.CITIZEN

        return User.objects.create_user(
            password=password,
            **validated_data
        )