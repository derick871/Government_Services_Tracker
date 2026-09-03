import logging
from django.shortcuts import render
import base64, json, requests
from django.conf import settings
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from.models import Payment
from.utils.pdfGenerator import generate_payment_pdf
from.utils.mpesa import get_mpesa_token, stk_push

# Create your views here.
logger= logging.getLogger(__name__)

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        phone = request.data.get('phone_number')
        amount = request.data.get('amount')
        tracking = request.data.get('tracking_number')

        if not phone or not amount:
            return Response({"detail": "phone and amount required"},status=400)

        Payment_obj= Payment.objects.create(
            user= request.user,

            phone_number= phone,
            amount= amount,
            tracking_number= tracking,
            status= 'PENDING'
        )

                # 3. Initiate Daraja STK Push
        try:
            response = stk_push(phone, amount, tracking)
            Payment_obj.checkout_request_id = response.get('CheckoutRequestID')
            Payment_obj.save()
            return Response({
                "message": "STK Push sent",
                "payment_id": Payment_obj.id,
                "checkout_id": Payment_obj.checkout_request_id
            })
        except Exception as e:
            Payment_obj.status = 'FAILED'
            Payment_obj.save()
            return Response({"detail": str(e)}, status=500)

class MpesaCallbackView(APIView):
    def post(self, request):
        data= request.data
        result= data.get('Body',{}).get('stkCallback',{}) 

        checkout_id= result.get('checkoutRequestID') 

        if not checkout_id:
            logger.warning("P-pesa callback received without CheckoutRequesID")
            return Response({"ResultCode": 1, "ResultDesc": "Invalid payload"})

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
                payment.save(update_field=['status'])
        except Payment.DoesNotExist:
            logger.error(f"Payment with CheckoutRequestID {checkout_id} not found during callback.")
        except Exception as e:
            logger.error(f"Error processing M-Pesa callback: {str(e)}")
            

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