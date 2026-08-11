from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):
    """Manager for custom email-based user authentication."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("An email address is required.")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", User.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model operating as the single source of truth for identity."""

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "System Administrator"
        OFFICER = "OFFICER", "County Government Officer"
        CITIZEN = "CITIZEN", "Standard Citizen Account"

    # Disable default username authentication
    username = None

    # Primary Identifier
    email = models.EmailField("Email Address", unique=True)

    # Role-Based Access Control (RBAC)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CITIZEN,
        db_index=True,
    )

    # Contact & Assignment metadata
    phone_number = models.CharField(max_length=15, blank=True, default="")
    county_code = models.CharField(
        max_length=10,
        blank=True,
        default="",
        help_text="County code assigned to county officers.",
    )

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    @property
    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN

    @property
    def is_officer(self) -> bool:
        return self.role == self.Role.OFFICER

    @property
    def is_citizen(self) -> bool:
        return self.role == self.Role.CITIZEN

    def __str__(self):
        return f"{self.email} ({self.role})"