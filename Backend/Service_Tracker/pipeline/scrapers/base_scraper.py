from abc import ABC, abstractmethod
import logging
import requests
import random
import time

logging=logging.getLogger(__name__)

class BaseScrapper(ABC):

    def __init__(self):
        self.session= requests.sessions

        self.user_agent=[
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"

        ]

    def _get_headers(self) -> dict:
        """Dynamically generates modern request headers for session insulation."""
        return {
            "User-Agent": random.choice(self.user_agents),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }
    @abstractmethod
    def scrape(self)->list[dict]:
        """Subclasses must implement extraction logic returning dictionaries."""
        pass