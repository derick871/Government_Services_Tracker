from django.apps import AppConfig

default_auto_field = 'django.db.models.BigAutoField'
class ServiceTrackerConfig(AppConfig):
    name = 'Service_Tracker'

    def ready(self):
        import Service_Tracker.signals
