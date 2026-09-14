from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Application, CountyNotice, StatusLog
from .serializers import (
    CountyNoticeSerializer,
    ApplicationCreateSerializer,
    ApplicationListSerializer,
    ApplicationDetailSerializer,
    ApplicationStatusSerializer,
    LoginSerializer,
)
from .permissions import (
    IsAuthenticatedUser,
    IsOfficerOrAdmin,
    IsApplicationOwner,
)
from .transitions import validate_transition, InvalidStateTransition


class CountyNoticeListView(generics.ListAPIView):
    """List all county notices."""
    queryset = CountyNotice.objects.all()
    serializer_class = CountyNoticeSerializer
    permission_classes = [AllowAny]


class CountyNoticeByCountyView(generics.ListAPIView):
    """List notices filtered by a specific county ID."""
    serializer_class = CountyNoticeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        county_id = self.kwargs["county_id"]
        return CountyNotice.objects.filter(county_id=county_id)


class ApplicationListCreateView(generics.ListCreateAPIView):
    """
    API endpoint to apply for a service (POST) 
    and list dashboard applications based on the authenticated user role (GET).
    """
    permission_classes = [IsAuthenticatedUser]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", None)

        if role == "ADMIN":
            return Application.objects.all()

        if role == "OFFICER":
            return Application.objects.filter(county_id=user.county_code)

        return Application.objects.filter(citizen=user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ApplicationCreateSerializer
        return ApplicationListSerializer

    def perform_create(self, serializer):
        serializer.save(citizen=self.request.user)


class ApplicationDetailView(generics.RetrieveAPIView):
    """Track single application details via tracking number."""
    serializer_class = ApplicationDetailSerializer
    permission_classes = [IsAuthenticatedUser, IsApplicationOwner]
    lookup_field = "tracking_number"
    queryset = Application.objects.all()


class UpdateApplicationStatusView(generics.GenericAPIView):
    """Update application workflow status with state validation and logging."""
    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = Application.objects.all()

    def patch(self, request, pk):
        application = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_state = serializer.validated_data["status"]
        comment = serializer.validated_data.get("comment", "")
        
        user_role = getattr(request.user, "role", "ADMIN").upper()
        current_state = application.status

        try:
            validate_transition(current_state, target_state, user_role)
        except InvalidStateTransition as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        application.status = target_state
        application.save()

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


class UserMeView(APIView):
    """Return current authenticated user details and role profile."""
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "role": getattr(user, "role", "CITIZEN"),
            "county_code": getattr(user, "county_code", None),
        })


class CookieTokenObtainPairView(TokenObtainPairView):
    """Custom Token Obtain Pair view that sets HTTP-only cookies for JWT tokens."""
    serializer_class = LoginSerializer

    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200 and 'access' in response.data:
            access = response.data['access']
            refresh = response.data['refresh']

            response.set_cookie(
                key='access_token',
                value=access,
                httponly=True,
                secure= True,
                samesite='None',
                max_age=60 * 15,  # 15 minutes
                path='/'
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                httponly=True,
                secure= True,
                samesite='Lax',
                max_age=60 * 60 * 24 * 7,  # 7 days
                path='/api/'
            )
        response.data= {"msg":"login success"}
        # return super().finalize_response(request, response, *args, **kwargs)