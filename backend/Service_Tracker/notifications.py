import logging
from typing import Iterable, Union

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Centralized notification service for email and SMS.
    """

    @staticmethod
    def send_sms(phone_number: str, message: str) -> bool:
        """
        Send an SMS through Africa's Talking.

        Returns True only when the request is successfully dispatched.
        """

        if not phone_number:
            logger.warning("SMS not sent: empty phone number.")
            return False

        username = getattr(settings, "AT_USERNAME", "")
        api_key = getattr(settings, "AT_API_KEY", "")

        if not username or not api_key:
            logger.error(
                "SMS not sent: Africa's Talking credentials are missing."
            )
            return False

        try:
            import africastalking

            africastalking.initialize(
                username,
                api_key,
            )

            sms = africastalking.SMS

            response = sms.send(
                message,
                [phone_number],
            )

            logger.info(
                "SMS dispatched to %s: %s",
                phone_number,
                response,
            )

            return True

        except Exception:
            logger.exception(
                "Failed to dispatch SMS to %s",
                phone_number,
            )
            return False

    @staticmethod
    def send_email(
        subject: str,
        recipient_email: Union[str, Iterable[str]],
        text_content: str,
        html_content: str = "",
    ) -> bool:
        """
        Send a transactional email through Django's configured backend.

        ``recipient_email`` may be one address or an iterable of addresses.
        ``html_content`` is optional; when provided, it is sent as the HTML
        alternative to the plain-text message.
        """

        if isinstance(recipient_email, str):
            recipients = [recipient_email.strip()] if recipient_email.strip() else []
        else:
            recipients = [email.strip() for email in recipient_email if email and email.strip()]

        if not recipients:
            logger.warning("Email not sent: empty recipient.")
            return False

        try:
            sent = send_mail(
                subject=subject,
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipients,
                fail_silently=False,
                html_message=html_content or None,
            )

            if sent == 0:
                logger.error(
                    "Email backend reported zero emails sent to %s.", recipients
                )
                return False

            logger.info(
                "Email successfully dispatched to %s", recipients
            )

            return True

        except Exception:
            logger.exception(
                "Email transmission failure to %s",
                recipient_email,
            )
            return False
