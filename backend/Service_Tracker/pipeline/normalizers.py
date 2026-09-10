import logging
from datetime import datetime
from django.core.exceptions import ValidationError
from Service_Tracker.models import CountyNotice

logger = logging.getLogger(__name__)

class NoticeNormalizer:
    REQUIRED_FIELDS = {"county_id", "title", "service_type", "deadline", "source_url"}
    VALID_SERVICES = {"LAND_RATE", "SINGLE_BUSINESS_PERMIT", "BURSARY", "HEALTH_CERTIFICATE", "OTHER"}

    @classmethod

    def normalize_and_save(cls, raw_payload: dict) -> bool:
        try:
            # Structural Validation
            missing_fields = cls.REQUIRED_FIELDS - set(raw_payload.keys())
            if missing_fields:
                raise ValidationError(f"Missing mandatory data contracts: {missing_fields}")

            # Text Normalization
            clean_title = raw_payload["title"].strip().upper()
            clean_county = raw_payload["county_id"].strip().upper()
            
            #  Service Type Mapping & Fallback
            service_type = raw_payload["service_type"].strip().upper()
            if service_type not in cls.VALID_SERVICES:
                service_type = "OTHER"
                # Strict Datetime Processing
            deadline_raw = raw_payload["deadline"]
            if isinstance(deadline_raw, datetime):
                deadline_dt = deadline_raw
            else:
                # Handle ISO format strings generated from spiders
                try:
                    deadline_dt = datetime.fromisoformat(deadline_raw.replace("Z", "+00:00"))
                except ValueError:
                    raise ValidationError(f"Invalid deadline timestamp structure: {deadline_raw}")

            #  Extract Requirements List
            requirements = raw_payload.get("requirements", [])
            if isinstance(requirements, str):
                requirements = [requirements]
            elif not isinstance(requirements, list):
                requirements = []

            # (Prevent duplicates via source URL)
            notice, created = CountyNotice.objects.update_or_create(
                source_url=raw_payload["source_url"].strip(),
                defaults={
                    "county_id": clean_county,
                    "title": clean_title,
                    "service_type": service_type,
                    "deadline": deadline_dt,
                    "requirements": requirements,
                }
            )
            
            if created:
                logger.info(f" Successfully registered new county notice: {clean_title} ({clean_county})")
            else:
                logger.info(f" Refreshed existing notice payload data: {clean_title}")
                
            return True

        except ValidationError as val_err:
            logger.error(f"Data contract normalization failure: {str(val_err)}")
            return False
        except Exception as system_err:
            logger.error(f"Unexpected error in pipeline persistence layer: {str(system_err)}")
            return False