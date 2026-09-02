from django.shortcuts import render
import base64, json, requests
from django.conf import settings
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from.models import Payment
from.utils.pdf_generator import generate_payment_pdf
from.utils.mpesa import get_mpesa_token, stk_push

# Create your views here.
class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        phone = request.data.get('phone_number')
        amount = request.data.get('amount')
        tracking = request.data.get('tracking_number')