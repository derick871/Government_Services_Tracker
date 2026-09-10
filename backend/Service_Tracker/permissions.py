from rest_framework.permissions import BasePermission, SAFE_METHODS


# ======================
# Authenticated Users
# ======================

class IsAuthenticatedUser(BasePermission):
    """Allow authenticated users only."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


# ======================
# Administrators
# ======================

class IsAdmin(BasePermission):
    """Allow administrators only."""

    message = "Administrator access required."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "ADMIN"
        )


# ======================
# County Officers
# ======================

class IsOfficer(BasePermission):
    """Allow county officers only."""

    message = "Officer access required."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "OFFICER"
        )


# ======================
# Citizens
# ======================

class IsCitizen(BasePermission):
    """Allow citizens only."""

    message = "Citizen access required."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "CITIZEN"
        )


# ======================
# Officers and Admins
# ======================

class IsOfficerOrAdmin(BasePermission):
    """Allow officers and administrators."""

    message = "Officer or administrator access required."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ["ADMIN", "OFFICER"]
        )


# ======================
# Read Only
# ======================

class ReadOnly(BasePermission):
    """Allow read-only requests."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


# ======================
# Application Owner
# ======================

class IsApplicationOwner(BasePermission):
    """Allow citizens to access only their applications."""

    message = "You do not have permission to access this application."

    def has_object_permission(self, request, view, obj):

        # Admin has full access
        if request.user.role == "ADMIN":
            return True

        # Officer can access applications in their county
        if request.user.role == "OFFICER":
            return obj.county_id == request.user.county_code

        # Citizen can access only their own application
        return obj.citizen == request.user


# ======================
# Notice Management
# ======================

class CanManageNotices(BasePermission):
    """Allow admins and officers to manage notices."""

    def has_permission(self, request, view):

        # Everyone can view notices
        if request.method in SAFE_METHODS:
            return True

        # Only officers/admins can modify
        return (
            request.user.is_authenticated and
            request.user.role in ["ADMIN", "OFFICER"]
        )


# ======================
# Application Workflow
# ======================

class CanChangeApplicationStatus(BasePermission):
    """Allow workflow updates."""

    message = "You cannot update application status."

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated and
            request.user.role in ["ADMIN", "OFFICER"]
        )


# ======================
# Superuser
# ======================

class IsSuperUser(BasePermission):
    """Allow Django superusers only."""

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated and
            request.user.is_superuser
        )