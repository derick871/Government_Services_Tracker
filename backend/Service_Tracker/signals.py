from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Application  # Adjust path to match your project layout
from .notifications import NotificationService

User = get_user_model()

@receiver(post_save, sender=User)
def trigger_account_verification_alert(sender, instance, created, **kwargs):
    """
    Alerts user upon account registration to securely check email for activation.
    """
    if created and not instance.is_active:
        email_subject = "Action Required: Verify Your Civic Portal Account"
        email_body = (
            f"Hello {instance.first_name or 'there'},\n\n"
            f"Your account has been successfully provisioned. To complete security checks, "
            f"please check your email account to verify your identity and activate your profile.\n\n"
            f"Regards,\nCounty Service Team"
        )
        sms_body = "Your account was created! Please navigate to your email account to verify and activate it."
        
        # Dispatch asynchronous execution blocks
        NotificationService.send_email(email_subject, instance.email, email_body)
        if hasattr(instance, 'profile') and instance.profile.phone_number:
            NotificationService.send_sms(instance.profile.phone_number, sms_body)


@receiver(post_save, sender=Application)
def trigger_application_state_alert(sender, instance, created, **kwargs):
    """
    Monitors state changes on citizen applications and routes contextual text/email logs.
    """
    # Define notification matrix parameters mapping states to template bodies
    STATE_TEMPLATES = {
        "SUBMITTED": {
            "subject": "Application Successfully Submitted",
            "email": "Your application has been received and logged into our system. Tracking ID: {id}.",
            "sms": "Application successfully submitted! Tracking ID: {id}."
        },
        "APPROVED": {
            "subject": "Application Update: Approved",
            "email": "Congratulations, your application (ID: {id}) has been formally approved.",
            "sms": "Great news! Your application (ID: {id}) has been approved."
        },
        "REJECTED": {
            "subject": "Application Update: Action Required",
            "email": "We regret to inform you that your application (ID: {id}) was rejected following standard evaluation metrics.",
            "sms": "Your application (ID: {id}) was rejected. Please review your email details."
        }
    }

    state = instance.status.upper()
    if state not in STATE_TEMPLATES:
        return

    # Check if state shifted or if it's a new instance submission
    if created or instance.tracker.has_changed('status'):
        templates = STATE_TEMPLATES[state]
        user = instance.user
        
        formatted_email = templates["email"].format(id=instance.id)
        formatted_sms = templates["sms"].format(id=instance.id)

        NotificationService.send_email(templates["subject"], user.email, formatted_email)
        if hasattr(user, 'profile') and user.profile.phone_number:
            NotificationService.send_sms(user.profile.phone_number, formatted_sms)