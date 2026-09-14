from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class to pull the JWT access token
    from HttpOnly cookies, with a fallback to the Authorization header.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = None

        if header is not None:
            raw_token = self.get_raw_token(header)
        
        # Fallback to reading the token from the HttpOnly cookie if header is empty
        if raw_token is None:
            raw_token = request.COOKIES.get("access_token")

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token