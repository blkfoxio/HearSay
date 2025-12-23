"""
URL configuration for HearSay backend.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from core.views import api_root, health_check

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/', api_root, name='api-root'),
    path('api/v1/health/', health_check, name='health-check'),

    # JWT Token endpoints (for development/testing)
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App-specific API routes
    path('api/v1/', include('users.urls')),
    path('api/v1/onboarding/', include('onboarding.urls')),
    path('api/v1/', include('lessons.urls')),
    # path('api/v1/phrasebook/', include('phrasebook.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
