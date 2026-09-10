import logging
import requests
from django.conf import settings
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from .utils.pdfGenerator import generate_payment_pdf
from .utils.mpesa import stk_push

logger = logging.getLogger(__name__)

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        phone = request.data.get('phone_number')
        amount = request.data.get('amount')
        tracking = request.data.get('tracking_number')

        if not phone or not amount:
            return Response({"detail": "Phone number and amount are required."}, status=400)

        payment_obj = Payment.objects.create(
            user=request.user,
            phone_number=phone,
            amount=amount,
            tracking_number=tracking,
            status='PENDING'
        )

        try:
            response = stk_push(phone, amount, tracking)
            if response.get('ResponseCode') == '0':
                payment_obj.checkout_request_id = response.get('CheckoutRequestID')
                payment_obj.save(update_fields=['checkout_request_id'])
                return Response({
                    "message": "STK Push sent successfully",
                    "payment_id": payment_obj.id,
                    "checkout_id": payment_obj.checkout_request_id
                })
            else:
                error_msg = response.get('errorMessage') or response.get('CustomerMessage', 'STK Push failed')
                raise Exception(error_msg)
        except Exception as e:
            payment_obj.status = 'FAILED'
            payment_obj.save(update_fields=['status'])
            return Response({"detail": str(e)}, status=500)


class MpesaCallbackView(APIView):
    def post(self, request):
        data = request.data
        result = data.get('Body', {}).get('stkCallback', {})
        checkout_id = result.get('CheckoutRequestID')

        if not checkout_id:
            logger.warning("M-Pesa callback received without CheckoutRequestID")
            return Response({"ResultCode": 1, "ResultDesc": "Invalid payload"})

        try:
            payment = Payment.objects.get(checkout_request_id=checkout_id)
            result_code = result.get('ResultCode')

            if result_code == 0:
                metadata = result.get('CallbackMetadata', {}).get('Item', [])
                receipt = next((i['Value'] for i in metadata if i['Name'] == 'MpesaReceiptNumber'), '')
                
                payment.mpesa_receipt = receipt
                payment.status = 'SUCCESS'
                payment.save()
                generate_payment_pdf(payment)
            else:
                payment.status = 'FAILED'
                payment.save(update_fields=['status'])

        except Payment.DoesNotExist:
            logger.error(f"Payment with CheckoutRequestID {checkout_id} not found during callback.")
        except Exception as e:
            logger.error(f"Error processing M-Pesa callback: {str(e)}")

        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})


class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)
            return Response({"status": payment.status})
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found"}, status=404)


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
            return Response({"detail": "Receipt not found or payment not completed"}, status=404)