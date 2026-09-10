from django.contrib import admin
from .models import Application, CountyNotice, StatusLog


# ======================
# Status Log Inline
# ======================

class StatusLogInline(admin.TabularInline):
    """Display audit trail history directly inside the Application detail view."""

    model = StatusLog
    extra = 0
    can_delete = False
    readonly_fields = (
        "from_state",
        "to_state",
        "changed_by",
        "comment",
        "timestamp",
    )

    def has_add_permission(self, request, obj=None):
        """Prevent manually adding log entries through the inline interface."""
        return False


# ======================
# County Notice Admin
# ======================

@admin.register(CountyNotice)
class CountyNoticeAdmin(admin.ModelAdmin):
    """Manage scraped county notices and service listings."""

    list_display = (
        "title",
        "county_id",
        "service_type",
        "deadline",
        "scraped_at",
    )
    list_filter = (
        "county_id",
        "service_type",
    )
    search_fields = (
        "title",
        "county_id",
    )
    ordering = ("-scraped_at",)
    readonly_fields = ("scraped_at",)
    date_hierarchy = "scraped_at"


# ======================
# Application Admin
# ======================

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """Manage citizen service applications."""

    list_display = (
        "tracking_number",
        "citizen",
        "county_id",
        "service_type",
        "status",
        "created_at",
    )
    list_filter = (
        "status",
        "county_id",
        "service_type",
    )
    search_fields = (
        "tracking_number",
        "citizen__email",
        "county_id",
    )
    ordering = ("-created_at",)
    readonly_fields = (
        "tracking_number",
        "created_at",
        "updated_at",
    )
    raw_id_fields = ("citizen",)
    list_select_related = ("citizen",)  # Prevents N+1 queries on user lookup
    date_hierarchy = "created_at"
    inlines = [StatusLogInline]


# ======================
# Status Log Admin
# ======================

@admin.register(StatusLog)
class StatusLogAdmin(admin.ModelAdmin):
    """Read-only view for application workflow transitions."""

    list_display = (
        "application",
        "from_state",
        "to_state",
        "changed_by",
        "timestamp",
    )
    list_filter = (
        "to_state",
        "timestamp",
    )
    search_fields = (
        "application__tracking_number",
        "changed_by__email",
    )
    ordering = ("-timestamp",)
    readonly_fields = (
        "application",
        "from_state",
        "to_state",
        "changed_by",
        "comment",
        "timestamp",
    )
    raw_id_fields = ("application", "changed_by")
    list_select_related = ("application", "changed_by")  # Prevents N+1 queries
    date_hierarchy = "timestamp"

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False