from uuid import uuid4

from rest_framework import serializers

from .FSM_transitions import get_allowed_next_states
from .models import Application, CountyNotice, StatusLog


# ======================
# County Notices
# ======================

class CountyNoticeSerializer(serializers.ModelSerializer):
    """Serialize county notices."""

    class Meta:
        model = CountyNotice
        fields = "__all__"
        read_only_fields = ("id", "scraped_at")


# ======================
# Status Logs
# ======================

class StatusLogSerializer(serializers.ModelSerializer):
    """Serialize application history."""

    changed_by = serializers.SerializerMethodField()

    class Meta:
        model = StatusLog
        fields = (
            "id",
            "from_state",
            "to_state",
            "changed_by",
            "comment",
            "timestamp",
        )

    def get_changed_by(self, obj):
        if obj.changed_by:
            return obj.changed_by.email
        return None


# ======================
# Create Application
# ======================

class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Create a new application."""

    class Meta:
        model = Application
        fields = (
            "county_id",
            "service_type",
            "payload_data",
        )

    def validate_county_id(self, value):
        """Validate county code."""
        if not value.strip():
            raise serializers.ValidationError("County ID is required.")
        return value.upper()

    def validate_payload_data(self, value):
        """Ensure payload is a JSON object."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Payload must be a JSON object.")
        return value

    def create(self, validated_data):
        """Create application with unique tracking number."""
        validated_data["tracking_number"] = f"TRK-{uuid4().hex[:8].upper()}"
        return Application.objects.create(**validated_data)


# ======================
# List Applications
# ======================

class ApplicationListSerializer(serializers.ModelSerializer):
    """Application summary."""

    class Meta:
        model = Application
        fields = (
            "id",
            "tracking_number",
            "service_type",
            "county_id",
            "status",
            "created_at",
            "updated_at",
        )


# ======================
# Application Details
# ======================

class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Detailed application view."""

    citizen = serializers.StringRelatedField()
    logs = StatusLogSerializer(
        many=True,
        read_only=True,
    )
    allowed_actions = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = (
            "id",
            "tracking_number",
            "citizen",
            "county_id",
            "service_type",
            "status",
            "payload_data",
            "created_at",
            "updated_at",
            "allowed_actions",
            "logs",
        )

    def get_allowed_actions(self, obj):
        """Return valid next states."""
        return get_allowed_next_states(obj.status)


# ======================
# Update Status
# ======================

class ApplicationStatusSerializer(serializers.Serializer):
    """Validate workflow status updates."""

    status = serializers.ChoiceField(choices=Application.Status.choices)
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )