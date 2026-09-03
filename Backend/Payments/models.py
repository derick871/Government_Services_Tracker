from django.db import models
from django.conf import settings

# Create your models here.
class Payment(models.Model):
    STATUS_CHOICES=[
        ('PENDING', 'pending'),
        ('SUCCESS', 'success'),
        ('FAILED', 'failed')
    ]
    user= models.ForeignKey(settings.AUTH_USER_MODEL, on_delete= models.CASCADE)
    tracking_number= models.CharField(max_length=50)

    phone_number= models.CharField(max_length=15)

    amount= models.DecimalField(max_digits=10, decimal_places=2)

    mpesa_reciept= models.CharField(max_length= 100, blank=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    pdf_receipt = models.FileField(upload_to='receipts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tracking_number} - KES {self.amount} - {self.status}"
