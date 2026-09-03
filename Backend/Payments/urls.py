from django.urls import path
from .views import (
    InitiatePaymentView,
    MpesaCallbackView,
    DownloadReceiptView,
)

app_name = 'payments'

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('<int:payment_id>/receipt/', DownloadReceiptView.as_view(), name='download-receipt'),
]