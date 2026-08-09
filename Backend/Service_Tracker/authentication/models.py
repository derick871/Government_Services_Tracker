from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


# ============================================================
# USER MANAGER
# ============================================================

class CustomUserManager(BaseUserManager):
    """Manager for email-based authentication."""

    def create_user(self, email, password=None, **extra_fields):

        if not email:
            raise ValueError("Email address is required.")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", "ADMIN")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")

        if extra_fields.get("is_superuser") is not True:
            raise ValueError(
                "Superuser must have is_superuser=True."
            )

        return self.create_user(
            email=email,
            password=password,
            **extra_fields
        )


# ============================================================
# CUSTOM USER
# ============================================================

class User(AbstractUser):

    ROLE_CHOICES = (
        ("ADMIN", "System Administrator"),
        ("OFFICER", "County Government Officer"),
        ("CITIZEN", "Standard Citizen Account"),
    )

    # Remove username authentication
    username = None

    # Identity
    email = models.EmailField(
        "Email Address",
        unique=True
    )

    # RBAC
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="CITIZEN"
    )

    # Contact
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    # County association
    county_code = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text="County code assigned to county officers."
    )

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.role})"