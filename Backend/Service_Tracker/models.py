from django.conf import settings
from django.db import models


class CountyNotice(models.Model):
    """Published county services and requirements."""

    class ServiceType(models.TextChoices):
        BUSINESS_PERMIT = "BUSINESS_PERMIT", "Business Permit"
        LAND_RATES = "LAND_RATES", "Land Rates"
        BURSARY = "BURSARY", "Bursary"
        HEALTH_CERT = "HEALTH_CERT", "Health Certificate"

    county_id = models.CharField(max_length=50, db_index=True)
    service_type = models.CharField(
        max_length=30,
        choices=ServiceType.choices,
        db_index=True,
    )
    title = models.CharField(max_length=255)
    requirements = models.JSONField(default=list)
    deadline = models.DateTimeField(null=True, blank=True)
    source_url = models.URLField()
    scraped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-scraped_at"]

    def __str__(self):
        return self.title


class Application(models.Model):
    """Citizen service applications."""

    class Status(models.TextChoices):
        SUBMITTED = "SUBMITTED", "Submitted"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        ACTION_REQUIRED = "ACTION_REQUIRED", "Action Required"
        VERIFIED = "VERIFIED", "Verified"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    county_id = models.CharField(max_length=50, db_index=True)
    service_type = models.CharField(
        max_length=30,
        choices=CountyNotice.ServiceType.choices,
        db_index=True,
    )
    tracking_number = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
    )
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.SUBMITTED,
        db_index=True,
    )
    payload_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.tracking_number


class StatusLog(models.Model):
    """Audit trail for tracking application state transitions."""

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="logs",
    )
    from_state = models.CharField(max_length=30)
    to_state = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="status_audit_logs",
    )
    comment = models.TextField(blank=True, default="")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.application.tracking_number} -> {self.to_state}"