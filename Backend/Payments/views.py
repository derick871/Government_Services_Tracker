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

        if not phone or not amount:
            return Response({"detail": "phone and amount required"},status=400)

        Payment= payment.objects.create(
            user= request.user,

            phone_number= phone,
            amount= amount,
            tracking_number= tracking,
            status= 'PENDING'
        )

                # 3. Initiate Daraja STK Push
        try:
            response = stk_push(phone, amount, tracking)
            payment.checkout_request_id = response.get('CheckoutRequestID')
            payment.save()
            return Response({
                "message": "STK Push sent",
                "payment_id": payment.id,
                "checkout_id": payment.checkout_request_id
            })
        except Exception as e:
            payment.status = 'FAILED'
            payment.save()
            return Response({"detail": str(e)}, status=500)

class MpesaCallbackView(APIView):
    def post(self, request):
        data= request.data
        result= data.get('Body',{}).get('stkCallback',{}) 

        checkout_id= result.get('checkoutRequestID') 

        try:
            payment = Payment.objects.get(checkout_request_id=checkout_id)
            if result.get('ResultCode') == 0:
                metadata = result.get('CallbackMetadata', {}).get('Item', [])
                receipt = next((i['Value'] for i in metadata if i['Name'] == 'MpesaReceiptNumber'), '')
                payment.mpesa_receipt = receipt
                payment.status = 'SUCCESS'
                payment.save()
                # Generate PDF
                generate_payment_pdf(payment)
            else:
                payment.status = 'FAILED'
                payment.save()
        except Payment.DoesNotExist:
            pass

        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

class DownloadReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user, status='SUCCESS')
            if not payment.pdf_receipt:
                generate_payment_pdf(payment)
            return FileResponse(
                payment.pdf_receipt.open('rb'),
                as_attachment=True,
                filename=f"eCitizen_Receipt_{payment.tracking_number}.pdf"
            )
        except Payment.DoesNotExist:
            return Response({"detail": "Receipt not found"}, status=404)