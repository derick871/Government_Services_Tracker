from datetime import datetime
import logging
from bs4 import BeautifulSoup
from Backend.Service_Tracker.pipeline.scrapers.base_scraper import BaseScrapper

logger = logging.getLogger(__name__)

class NairobiSpiders(BaseScrapper):
    def __init__(self):
        super().__init__()
        self.target_url = "https://nairobi.go.ke/notices/"

    def Scrapers(self) -> list[dict]:
        extracted_records = []
        try:
            logger.info(f"Starting Nairobi data extraction pipeline targeting: {self.target_url}")
            html_content = self.fetch_html(self.target_url)

            if not html_content:
                return extracted_records

            soup = BeautifulSoup(html_content, "html.parser")

            notice_elements = soup.find_all("div", class_="notice-card-layout")

            for element in notice_elements:
                try:
                    title_text = element.find("h3", class_="notice-title").get_text(strip=True)

                    # Skip irrelevant updates to optimize processing speeds
                    if not any(keyword in title_text.upper() for keyword in ["BURSARY", "PERMIT", "RATES"]):
                        continue

                    raw_date = element.find("span", class_="closing-date").get_text(strip=True)
                    # Standardize dates from standard formats (e.g., "Deadline: 15 Aug 2026")
                    clean_date_str = raw_date.replace("Deadline:", "").strip()
                    parsed_deadline = datetime.strptime(clean_date_str, "%d %b %Y").isoformat()

                    link_anchor = element.find("a", class_="download-link")
                    source_link = link_anchor["href"] if link_anchor else self.target_url
                    # Construct structural transaction payload matching standard schema models
                    notice_payload = {
                        "county_id": "KE-COUNTY-047",
                        "service_type": "BURSARY" if "BURSARY" in title_text.upper() else "BUSINESS_PERMIT",
                        "title": title_text,
                        "deadline": parsed_deadline,
                        "requirements": [req.get_text(strip=True) for req in element.find_all("li", class_="req-item")],
                        "source_url": source_link,
                    }
                    extracted_records.append(notice_payload)

                except Exception as entry_error:
                    logger.error(f"Failed parsing inner notice elements block element: {entry_error}")
                    continue

        except Exception as system_error:
            logger.critical(f"Nairobi structural spider crash encountered: {system_error}")

        return extracted_records