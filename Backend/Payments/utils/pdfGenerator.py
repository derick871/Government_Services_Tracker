import os
import logging
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from django.conf import settings
from django.core.files 
import File

logger = logging.getLogger(__name__)
def generate_payment_pdf(payment):
    filename = f"receipt_{payment.tracking_number}_{payment.id}.pdf"
    filepath = os.path.join(settings.MEDIA_ROOT, 'receipts', filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    doc = SimpleDocTemplate(filepath, pagesize=A4, topMargin=50)
    styles = getSampleStyleSheet()
    story = []

    # Header
    story.append(Paragraph("<b>Government of Kenya - eCitizen</b>", styles['Heading1']))
    story.append(Paragraph("Official Payment Receipt", styles['Heading2']))
    story.append(Spacer(1, 20))

    data = [
        ["Tracking No:", payment.tracking_number],
        ["M-Pesa Receipt:", payment.mpesa_receipt or "N/A"],
        ["Phone Number:", payment.phone_number],
        ["Amount Paid:", f"KES {payment.amount}"],
        ["Status:", payment.status],
        ["Date:", payment.created_at.strftime("%d %b %Y %H:%M")],
        ["Paid By:", payment.user.email],
    ]

    table = Table(data, colWidths=[150, 300])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#0A1931')),
        ('TEXTCOLOR', (0,0), (0,-1), colors.white),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor('#F4F6F9')),
        ('GRID', (0,0), (-1,-1), 1, colors.grey),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(table)
    story.append(Spacer(1, 30))
    story.append(Paragraph("This is a system generated receipt. Secured by eCitizen & M-Pesa.", styles['Normal']))

    doc.build(story)

    # Save to model
    filename = f"receipt_{payment.tracking_number}_{payment.id}.pdf"
    with open(filepath, 'rb') as f:
        payment.pdf_receipt.save(filename, File(f), save=True)

    return payment.pdf_receipt.name


