from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate


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
class LoginSerializer(TokenObtainPairSerializer):
    """Authenticate explicitly using email and password."""
    
    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.EmailField()
        if 'username' in self.fields:
            self.fields.pop('username')

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            
            if not user:
                raise serializers.ValidationError("No active account found with the given credentials.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
                
            self.user = user
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")

        refresh = self.get_token(self.user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": self.user.role,
            "user": {
                "id": self.user.id,
                "email": self.user.email,
                "first_name": getattr(self.user, "first_name", ""),
                "last_name": getattr(self.user, "last_name", ""),
                "role": self.user.role,
                "county_code": getattr(self.user, "county_code", None),
            }
        }
        return data

