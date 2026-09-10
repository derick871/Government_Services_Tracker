import os
from celery import Celery
from celery import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')

# Read configuration keys directly from Django settings using the 'CELERY_' prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover asynchronous tasks.py files across registered apps.
app.autodiscover_tasks()

# Configure the Celery Beat Scheduler for periodic automation tasks
app.conf.beat_schedule = {
    'run-county-scrapers-every-midnight': {
        'task': 'pipeline.tasks.run_nairobi_pipeline_job',
        # Fires exactly at 00:00 daily  
        'schedule': crontab(hour=0, minute=0),               
    },
}