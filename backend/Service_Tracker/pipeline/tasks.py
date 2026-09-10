from Backend.Service_Tracker.pipeline.scrapers.nairobi_spider import NairobiSpider
from pipeline.normalizers import NoticeNormalizer
from pipeline.utils import CommunicationHub

def run_nairobi_pipeline_job():
    spider = NairobiSpider()
    raw_records = spider.scrape() # Pulls messy arrays from HTML cards
    
    for raw_data in raw_records:
        # Normalizer verifies structural validity and saves to database
        success = NoticeNormalizer.normalize_and_save(raw_data)
        
        # If it's a critical land rate deadline alert, push an immediate notification
        if success and "RATE" in raw_data["title"]:
            CommunicationHub.send_sms_alert(
                phone_number="+25447668544", 
                message=f"Alert: New County Notice Published - {raw_data['title']}. Check the portal for details."
            )