from uuid import uuid4
from rest_framework import serializers

from .transitions import get_allowed_next_states
from .models import Application, CountyNotice, StatusLog


class CountyNoticeSerializer(serializers.ModelSerializer):
    """Serialize county notices."""

    class Meta:
        model = CountyNotice
        fields = "__all__"
        read_only_fields = ("id", "scraped_at")


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


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Create a new application by referencing a CountyNotice service ID."""

    service_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "service_id",
            "county_id",
            "service_type",
            "payload_data",
            "tracking_number",
        )
        read_only_fields = ("id", "tracking_number", "county_id", "service_type")
 
    def validate_payload_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Payload must be a JSON object.")
        return value

    def validate(self, attrs):
        service_id = attrs.pop("service_id", None)
        
        try:
            notice = CountyNotice.objects.get(id=service_id)
            attrs["service_type"] = notice.service_type
            attrs["county_id"] = notice.county_id
        except CountyNotice.DoesNotExist:
            raise serializers.ValidationError({"service_id": "Invalid or inactive government service ID."})
            
        return attrs

    def create(self, validated_data):
        validated_data["tracking_number"] = f"TRK-{uuid4().hex[:8].upper()}"
        return Application.objects.create(**validated_data)


class ApplicationListSerializer(serializers.ModelSerializer):
    """Application summary for dashboards."""

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


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Detailed application view."""

    citizen = serializers.StringRelatedField()
    logs = StatusLogSerializer(many=True, read_only=True)
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
        return get_allowed_next_states(obj.status)


class ApplicationStatusSerializer(serializers.Serializer):
    """Validate workflow status updates."""

    status = serializers.ChoiceField(choices=Application.Status.choices)
    comment = serializers.CharField(required=False, allow_blank=True, default="")
