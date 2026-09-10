import logging
import os
import requests
from django.core.mail import send_mail
from django.conf import settings

logger=logging.getLogger(__name__)

class CommunicationHub:
    @staticmethod

    def send_sms_alert(phone_number, message):
        userName= os.getenv("userName")
        api_key= os.getenv ("API_KEY")

        if not api_key:
            logger.warning(f"[MOCK SMS] Outbount to {phone_number}: {message}")
            return True
        url = "https://api.africastalking.com/version1/messaging"
        headers = {
            "ApiKey": api_key,
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "username": userName,
            "to": phone_number,
            "message": message
        }

        try:
            response = requests.post(url, headers=headers, data=data, timeout=10)
            response_json = response.json()

            # Check delivery report structural status
            recipients = response_json.get("SMSMessageData", {}).get("Recipients", [])
            if recipients and recipients[0].get("status") in ["Success", "UserInBlackList"]:
                logger.info(f"Programmatic SMS successfully pushed to pipeline queue for {phone_number}")
                return True
                
            logger.error(f"SMS Gateway rejected dispatch attempt: {response_json}")
            return False

        except requests.RequestException as network_error:
            logger.error(f"External HTTP network failure communicating with SMS gateway: {str(network_error)}")
            return False

    @staticmethod
    def send_transactional_email(recipient_email: str, subject: str, template_body: str) -> bool:
        """
        Pushes a standard formatting transactional notification email to a citizen user.
        """
        try:
            send_mail(
                subject=subject,
                message=template_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            logger.info(f"Successfully transmitted notification email message to {recipient_email}")
            return True
        except Exception as email_err:
            logger.error(f"Transactional system mail routing delivery failure: {str(email_err)}")
            return False


