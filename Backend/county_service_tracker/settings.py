"""
Django settings for county_service_tracker project.
Refined for Capstone Production & Render Deployment Standards.
"""

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
from decouple import config
from dotenv import load_dotenv

# Load environment variables from a root .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', config('DJANGO_SECRET_KEY', default='django-insecure-*a^dt=*n%w$tk54hvx$(*m(0&0n#79k#^&$=!+2klj^&+62obw'))

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'

# Render dynamically passes RENDER_EXTERNAL_HOSTNAME upon deployment
RENDER_EXTERNAL_HOSTNAME = os.getenv('RENDER_EXTERNAL_HOSTNAME')

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.onrender.com',  # Matches any Render app domain
]
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Additional allowed hosts passed as a space/comma-separated string
EXTRA_ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split()
if EXTRA_ALLOWED_HOSTS:
    ALLOWED_HOSTS.extend([host.strip() for host in EXTRA_ALLOWED_HOSTS if host.strip()])


# Application definition

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
    
    # Custom Core System Apps
    'Service_Tracker', 
    'authentication',
]

# Unified Identity Blueprint Router mapping custom RBAC User profiles
AUTH_USER_MODEL = 'authentication.User'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Intercepts cross-origin requests at top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serves production static files efficiently
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
# Uses Render's DATABASE_URL string in production with automatic fallback to local env values
DATABASE_URL = os.getenv('DATABASE_URL')

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


# Cross-Origin Resource Sharing (CORS) & CSRF Configuration
# Permits communication with Vite/React single page applications
DEFAULT_CORS_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
]

RAW_CORS_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '')
if RAW_CORS_ORIGINS:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in RAW_CORS_ORIGINS.split() if origin.strip()]
else:
    CORS_ALLOWED_ORIGINS = DEFAULT_CORS_ORIGINS

CSRF_TRUSTED_ORIGINS = [
    f"https://{RENDER_EXTERNAL_HOSTNAME}" if RENDER_EXTERNAL_HOSTNAME else "http://localhost:5173",
    "https://*.onrender.com",
]


# Django REST Framework & OpenAPI Documentation Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}


# SimpleJWT Stateless Lifecycle Parameters
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}


# Distributed Task Engine Architecture (Redis & Celery Setup)
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'


# Transactional Outbound Mail Server Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = f"County Service Tracker <{EMAIL_HOST_USER}>" if EMAIL_HOST_USER else "noreply@county.go.ke"


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization & Regional Localization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True


# Static Files (CSS, JavaScript, Images) for Render / WhiteNoise
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'