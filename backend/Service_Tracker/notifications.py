import logging
import os
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def send_sms(phone_number: str, message: str) -> bool:
        """
        Dispatches SMS via AfricasTalking API wrapper.
        """
        username = os.getenv("AT_USERNAME")
        api_key = os.getenv("AT_API_KEY")
        
        if not username or not api_key:
            logger.warning(f"[SMS STUB] To: {phone_number} | Msg: {message}")
            return True
            
        # Lazy load to avoid loading overhead when initialized
        import africastalking
        africastalking.initialize(username, api_key)
        sms = africastalking.SMS
        
        try:
            response = sms.send(message, [phone_number])
            logger.info(f"SMS status dispatched to {phone_number}: {response}")
            return True
        except Exception as e:
            logger.error(f"Failed to dispatch SMS to {phone_number}: {str(e)}")
            return False

    @staticmethod
    def send_email(subject: str, recipient_email: str, text_content: str) -> bool:
        """
        Dispatches a transactional email using Django core mail routing.
        """
        try:
            send_mail(
                subject=subject,
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            logger.info(f"Email successfully dispatched to {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Email transmission failure to {recipient_email}: {str(e)}")
            return False