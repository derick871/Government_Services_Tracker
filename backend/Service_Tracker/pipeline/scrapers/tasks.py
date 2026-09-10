from Service_Tracker.models import CountyNotice
from Backend.Service_Tracker.pipeline.scrapers.Kakamega_spiders import KakamegaSpiders
from Service_Tracker import apps
from Backend.Service_Tracker.pipeline.scrapers.nairobi_spider import NairobiSpiders

@apps.tasks

def run_all_spiders():
    spiders= NairobiSpiders(), KakamegaSpiders

    for spider in spider:
        results= spider.scrape()

    for payload in results:
        CountyNotice.objects.update_or_create(
            source_urls= payload["source_urls"],
            defaults= payload
        )