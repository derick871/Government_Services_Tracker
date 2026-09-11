from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import CountyNotice, Application, StatusLog
from .serializers import (
    CountyNoticeSerializer,
    ApplicationCreateSerializer,
    ApplicationListSerializer,
    ApplicationDetailSerializer,
    ApplicationStatusSerializer,
)
from .permissions import (
    IsAuthenticatedUser,
    IsOfficerOrAdmin,
    IsApplicationOwner,
)
from .Transitions import validate_transition, InvalidStateTransition


class CountyNoticeListView(generics.ListAPIView):
    """List all county notices."""
    queryset = CountyNotice.objects.all()
    serializer_class = CountyNoticeSerializer
    permission_classes = [AllowAny]


class CountyNoticeByCountyView(generics.ListAPIView):
    """List notices by county."""
    serializer_class = CountyNoticeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        county_id = self.kwargs["county_id"]
        return CountyNotice.objects.filter(county_id=county_id)


class ApplicationListCreateView(generics.ListCreateAPIView):
    """
    API endpoint to apply for a service (POST) 
    and list dashboard applications based on user role (GET).
    """
    permission_classes = [IsAuthenticatedUser]

    def get_queryset(self):
        user = self.request.user

        # Admin views all system applications
        if getattr(user, "role", None) == "ADMIN":
            return Application.objects.all()

        # Officer views applications mapped to their specific county code
        if getattr(user, "role", None) == "OFFICER":
            return Application.objects.filter(county_id=user.county_code)

        # Citizens view only their own created applications
        return Application.objects.filter(citizen=user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ApplicationCreateSerializer
        return ApplicationListSerializer

    def perform_create(self, serializer):
        # Automatically attach the authenticated user to the application dashboard
        serializer.save(citizen=self.request.user)


class ApplicationDetailView(generics.RetrieveAPIView):
    """Track single application details."""
    serializer_class = ApplicationDetailSerializer
    permission_classes = [IsAuthenticatedUser, IsApplicationOwner]
    lookup_field = "tracking_number"
    queryset = Application.objects.all()


class UpdateApplicationStatusView(generics.GenericAPIView):
    """Update application workflow status."""
    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = Application.objects.all()

    def patch(self, request, pk):
        application = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data["status"]
        comment = serializer.validated_data.get("comment", "")

        try:
            validate_transition(
                current_state=application.status,
                target_state=new_status,
                user_role=request.user.role,
            )

            old_status = application.status
            application.status = new_status
            application.save()

            StatusLog.objects.create(
                application=application,
                from_state=old_status,
                to_state=new_status,
                changed_by=request.user,
                comment=comment,
            )

            return Response(
                {
                    "message": "Status updated successfully.",
                    "tracking_number": application.tracking_number,
                    "old_status": old_status,
                    "new_status": new_status,
                },
                status=status.HTTP_200_OK,
            )

        except InvalidStateTransition as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

class UpdateApplicationStatusView(generics.GenericAPIView):
    """Update application workflow status."""
    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = Application.objects.all()

    def patch(self, request, pk):
        application = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_state = serializer.validated_data["status"]
        comment = serializer.validated_data.get("comment", "")
        
        # Determine role (fallback to user model attribute or string representation)
        user_role = getattr(request.user, "role", "ADMIN").upper()
        current_state = application.status

        try:
            # Validate transition using your workflow transition rules engine
            validate_transition(current_state, target_state, user_role)
        except InvalidStateTransition as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Update application state
        application.status = target_state
        application.save()

        # Log state change for full traceability
        StatusLog.objects.create(
            application=application,
            from_state=current_state,
            to_state=target_state,
            changed_by=request.user,
            comment=comment
        )

        return Response(
            ApplicationDetailSerializer(application).data,
            status=status.HTTP_200_OK
        ) 