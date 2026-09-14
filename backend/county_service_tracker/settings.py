"""
Django settings for county_service_tracker project.
Refined for Capstone Production & Render/Vercel Deployment Standards.
"""

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
from decouple import config, UndefinedValueError
from dotenv import load_dotenv

# Load environment variables from a root .env file if present
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Core Security & Environment
SECRET_KEY = config('DJANGO_SECRET_KEY', default='unsafe-secret-key-for-dev')
DEBUG = config('DJANGO_DEBUG', default=False, cast=bool)

# Host Configuration
RENDER_EXTERNAL_HOSTNAME = os.getenv('RENDER_EXTERNAL_HOSTNAME')

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'government-services-tracker.vercel.app',
    'government-services-tracker-6.onrender.com',
]

if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Additional allowed hosts passed via environment string
EXTRA_ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='')
if EXTRA_ALLOWED_HOSTS:
    ALLOWED_HOSTS.extend([host.strip() for host in EXTRA_ALLOWED_HOSTS.split(',') if host.strip()])


# Application Definition
INSTALLED_APPS = [
    'django.contrib.admindocs',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-Party Architecture Ecosystem
    'rest_framework',
    'drf_spectacular',
    'corsheaders',
    'rest_framework_simplejwt',  
    
    # System Apps
    'Service_Tracker', 
    'authentication',
    'Payments',
]

# Custom RBAC User Model Blueprint
AUTH_USER_MODEL = 'authentication.User'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be as high as possible
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Production static file optimization
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'county_service_tracker.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'county_service_tracker.wsgi.application'


# Database Configuration
DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config("DATABASE_NAME", default="county_service_tracker_db"),
            'USER': config("DATABASE_USER", default="postgres"),
            'PASSWORD': config("DATABASE_PASSWORD", default="postgres"),
            'PORT': config("DATABASE_PORT", default="5432"),
            'HOST': config("DATABASE_HOST", default="localhost"),
        }
    }


# CORS & Cookie Security Configuration
CORS_ALLOW_CREDENTIALS = True  

DEFAULT_CORS_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://government-services-tracker.vercel.app',
    'https://government-services-tracker-eomvnif7y-derick871s-projects.vercel.app/',

]

RAW_CORS_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='')
if RAW_CORS_ORIGINS:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in RAW_CORS_ORIGINS.split(',') if origin.strip()]
else:
    CORS_ALLOWED_ORIGINS = DEFAULT_CORS_ORIGINS

CSRF_TRUSTED_ORIGINS = [
    "https://*.onrender.com",
    "https://government-services-tracker-7.onrender.com",
    "https://government-services-tracker.vercel.app",
]
if RENDER_EXTERNAL_HOSTNAME:
    CSRF_TRUSTED_ORIGINS.append(f"https://{RENDER_EXTERNAL_HOSTNAME}")


# Django REST Framework Integration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'authentication.authentications.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}


# SimpleJWT Stateless Lifecycle Parameters
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}


# Distributed Task Engine Architecture (Redis & Celery)
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'


# Transactional Outbound Mail Server Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = f"County Service Tracker <{EMAIL_HOST_USER}>" if EMAIL_HOST_USER else "noreply@county.go.ke"


# Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization & Regional Localization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True


# Static & Media Files (WhiteNoise Storage Strategy)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
 

# Integration Keys (M-Pesa API Ecosystem)
MPESA_ENV = config("MPESA_ENV", default="sandbox")
MPESA_SHORTCODE = config("MPESA_B2C_SHORTCODE", default="")
MPESA_CONSUMER_KEY = config("MPESA_CUSTOMER_KEY", default="")
MPESA_CONSUMER_SECRET = config("MPESA_B2C_SECURITY_CREDENTIAL", default="") 
MPESA_PASSKEY = config("MPESA_PASSKEY", default="")
MPESA_CALLBACK_URL = config("MPESA_CALLBACK_URL", default="")