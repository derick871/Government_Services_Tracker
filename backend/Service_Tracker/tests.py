from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

class UserModelTests(TestCase):
    def test_create_user(self):
        """Verify that a user is successfully created with custom attributes."""
        user = User.objects.create_user(
            email="wanyama@gmail.com",
            password="deroo3335551",
            first_name="Deroo"
        )
        self.assertEqual(user.email, "wanyama@gmail.com")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

class AuthenticationAPITests(APITestCase):
    def setUp(self):
        """Set up a test user before running API endpoint tests."""
        self.user = User.objects.create_user(
            email="demarco@nairobi.go.ke",
            password="ESY3596"
        )
        self.login_url = reverse('Service_Tracker:token_obtain_pair')
    def test_jwt_login_success(self):
        """Verify that valid credentials return access and refresh JWT tokens."""
        data = {
            "email": "demarco@nairobi.go.ke",
            "password": "ESY3596"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)