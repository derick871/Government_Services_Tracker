from datetime import datetime, timedelta
import logging
from bs4 import BeautifulSoup
from Backend.Service_Tracker.pipeline.scrapers.base_scraper import BaseScraper  

logger = logging.getLogger(__name__)

class KakamegaSpiders(BaseScraper):
    def __init__(self):
        super().__init__()
        self.target_url = "https://kakamega.co.ke/category/announcements"

    def scrape(self) -> list[dict]:
        extracted_records = []
        try:
            logger.info(f"Starting Kakamega data extraction pipeline targeting: {self.target_url}")
            html_content = self.fetch_html(self.target_url)
            
            if not html_content:
                return extracted_records

            soup = BeautifulSoup(html_content, "html.parser")
            table_rows = soup.find_all("tr", class_="announcement-row")

            for row in table_rows:
                try:
                    columns = row.find_all("td")
                    if len(columns) < 3:
                        continue

                    title_text = columns[0].get_text(strip=True)

                    if "LAND" in title_text.upper() or "RATE" in title_text.upper():
                        service = "LAND_RATE"
                    elif "HEALTH" in title_text.upper():
                        service = "HEALTH_CERTIFICATE"
                    else:
                        continue

                    # Handle raw time strings
                    raw_published_date = columns[1].get_text(strip=True)
                    base_date = datetime.strptime(raw_published_date, "%Y-%m-%d")
                    calculated_deadline = (base_date + timedelta(days=30)).isoformat()
                        
                    link_element = columns[2].find("a")
                    source_link = link_element['href'] if link_element else self.target_url

                    notice_payload = {
                        "county_id": "key_County_037",
                        "title": title_text,
                        "service_type": service,
                        "deadline": calculated_deadline,
                        "requirement": "Detected in original document",
                        "source_url": source_link
                    }

                    extracted_records.append(notice_payload)

                except Exception as row_error:
                    logger.error(f"Failed to parse inner row block in Kakamega spider: {str(row_error)}")
                    continue  
        except Exception as system_error:
            logger.critical(f"Kakamega execution failure occurred: {str(system_error)}")

        return extracted_records