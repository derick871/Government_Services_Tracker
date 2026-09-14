import logging

from django.contrib.auth import get_user_model
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from .models import Application
from .notifications import NotificationService

User = get_user_model()

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def trigger_account_verification_alert(sender, instance, created, **kwargs):
    """
    Notify a newly created inactive user that account verification is required.
    """

    if not created:
        return

    if instance.is_active:
        return

    if not instance.email:
        logger.warning(
            "Cannot send account verification notification: "
            "user %s has no email address.",
            instance.pk,
        )
        return

    email_subject = "Action Required: Verify Your Civic Portal Account"

    email_body = (
        f"Hello {instance.first_name or 'there'},\n\n"
        "Your account has been successfully created. "
        "Please check your email and complete the verification process "
        "to activate your account.\n\n"
        "Regards,\n"
        "County Service Team"
    )

    sms_body = (
        "Your County Service Tracker account was created. "
        "Please check your email to verify and activate your account."
    )

    try:
        NotificationService.send_email(
            email_subject,
            instance.email,
            email_body,
        )
    except Exception:
        logger.exception(
            "Account verification email failed for user %s",
            instance.pk,
        )

    profile = getattr(instance, "profile", None)

    if profile and getattr(profile, "phone_number", None):
        try:
            NotificationService.send_sms(
                profile.phone_number,
                sms_body,
            )
        except Exception:
            logger.exception(
                "Account verification SMS failed for user %s",
                instance.pk,
            )


@receiver(pre_save, sender=Application)
def capture_application_previous_status(
    sender,
    instance,
    **kwargs,
):
    """
    Capture the previous database status before an Application is saved.
    """

    if not instance.pk:
        instance._old_status = None
        return

    try:
        old_instance = sender.objects.get(pk=instance.pk)
        instance._old_status = old_instance.status
    except sender.DoesNotExist:
        instance._old_status = None


@receiver(post_save, sender=Application)
def trigger_application_state_alert(
    sender,
    instance,
    created,
    **kwargs,
):
    """
    Send notifications only when an application's status actually changes.
    """

    old_status = getattr(instance, "_old_status", None)
    new_status = instance.status

    # Only notify for newly-created SUBMITTED applications
    # or an actual status transition.
    status_changed = created or old_status != new_status

    if not status_changed:
        return

    STATE_TEMPLATES = {
        Application.Status.SUBMITTED: {
            "subject": "Application Successfully Submitted",
            "email": (
                "Your application has been received and logged into "
                "our system. Tracking ID: {tracking_number}."
            ),
            "sms": (
                "Application successfully submitted! "
                "Tracking ID: {tracking_number}."
            ),
        },
        Application.Status.UNDER_REVIEW: {
            "subject": "Application Under Review",
            "email": (
                "Your application (Tracking ID: {tracking_number}) "
                "is now under review."
            ),
            "sms": (
                "Your application {tracking_number} is now under review."
            ),
        },
        Application.Status.ACTION_REQUIRED: {
            "subject": "Action Required on Your Application",
            "email": (
                "Your application (Tracking ID: {tracking_number}) "
                "requires additional action. Please check your portal "
                "for details."
            ),
            "sms": (
                "Action required for application {tracking_number}. "
                "Please check your portal."
            ),
        },
        Application.Status.VERIFIED: {
            "subject": "Application Verified",
            "email": (
                "Your application (Tracking ID: {tracking_number}) "
                "has been verified and is awaiting final processing."
            ),
            "sms": (
                "Application {tracking_number} has been verified."
            ),
        },
        Application.Status.APPROVED: {
            "subject": "Application Update: Approved",
            "email": (
                "Congratulations. Your application "
                "(Tracking ID: {tracking_number}) has been approved."
            ),
            "sms": (
                "Good news! Application {tracking_number} "
                "has been approved."
            ),
        },
        Application.Status.REJECTED: {
            "subject": "Application Update: Rejected",
            "email": (
                "Your application (Tracking ID: {tracking_number}) "
                "has been rejected. Please check the portal for details."
            ),
            "sms": (
                "Application {tracking_number} was rejected. "
                "Please check your portal for details."
            ),
        },
    }

    template = STATE_TEMPLATES.get(new_status)

    if not template:
        return

    citizen = instance.citizen

    if not citizen.email:
        logger.warning(
            "Application %s citizen has no email address.",
            instance.tracking_number,
        )
    else:
        formatted_email = template["email"].format(
            tracking_number=instance.tracking_number,
        )

        NotificationService.send_email(
            template["subject"],
            citizen.email,
            formatted_email,
        )

    profile = getattr(citizen, "profile", None)

    if profile and getattr(profile, "phone_number", None):
        formatted_sms = template["sms"].format(
            tracking_number=instance.tracking_number,
        )

        NotificationService.send_sms(
            profile.phone_number,
            formatted_sms,
        )
