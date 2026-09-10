import requests
import base64
import datetime
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def get_mpesa_token():
    """
    Generates an OAuth access token from the Safaricom Daraja API
    using Consumer Key and Consumer Secret credentials.
    """
    base_url = getattr(settings, 'MPESA_BASE_URL', 'https://sandbox.safaricom.co.ke')
    url = f"{base_url}/oauth/v1/generate?grant_type=client_credentials"
    
    try:
        response = requests.get(
            url, 
            auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
            timeout=30
        )
        response.raise_for_status()
        token_data = response.json()
        return token_data.get('access_token')
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to authenticate with M-Pesa API: {str(e)}")
        raise Exception("M-Pesa authentication failed. Please try again later.")

def stk_push(phone, amount, account_ref):
    """
    Triggers an M-Pesa STK Push prompt directly to the customer's phone.
    
    :param phone: Formatted phone number (e.g., 2547XXXXXXXX)
    :param amount: Payment amount (Integer or Float)
    :param account_ref: Tracking number or reference ID for the invoice
    :return: Dictionary containing Safaricom's response JSON
    """
    token = get_mpesa_token()
    base_url = getattr(settings, 'MPESA_BASE_URL', 'https://sandbox.safaricom.co.ke')
    url = f"{base_url}/mpesa/stkpush/v1/processrequest"

    # Generate timestamp format: YYYYMMDDHHMMSS
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    
    # Construct security password by base64 encoding Shortcode + Passkey + Timestamp
    password_str = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(float(amount)),
        "PartyA": phone,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": str(account_ref),
        "TransactionDesc": f"Payment for Service {account_ref}"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        res_data = response.json()
        
        # Log unexpected non-zero or error responses from Daraja for auditing
        if response.status_code != 200 or res_data.get('ResponseCode') != '0':
            logger.warning(f"Daraja STK Push returned non-success response: {res_data}")
            
        return res_data
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error during STK Push invocation: {str(e)}")
        raise Exception("Network error connecting to M-Pesa payment gateway.")