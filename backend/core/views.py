"""
Core views for API root and health checks.
"""

from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API Root endpoint.

    Returns available API endpoints and version information.
    """
    return Response({
        'name': 'HearSay API',
        'version': settings.API_VERSION,
        'endpoints': {
            'health': '/api/v1/health/',
            'token': '/api/v1/token/',
            'token_refresh': '/api/v1/token/refresh/',
            # Future endpoints (commented until implemented)
            # 'auth': '/api/v1/auth/',
            # 'me': '/api/v1/me/',
            # 'onboarding': '/api/v1/onboarding/',
            # 'lessons': '/api/v1/lessons/',
            # 'plan': '/api/v1/plan/',
            # 'phrasebook': '/api/v1/phrasebook/',
            # 'situations': '/api/v1/situations/',
            # 'progress': '/api/v1/progress/',
        },
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring.

    Returns basic health status for the API.
    """
    return Response({
        'status': 'healthy',
        'version': settings.API_VERSION,
        'debug': settings.DEBUG,
    })
