"""
User authentication views.

Handles SSO authentication and user profile endpoints.
"""

import secrets
import string
import logging

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer
from .services import (
    verify_sso_token,
    verify_sso_token_dev,
    SSOUserInfo,
    TokenVerificationError,
)

logger = logging.getLogger('hearsay')


def generate_username(email: str) -> str:
    """
    Generate a unique username from email.

    Format: email_prefix + random suffix
    """
    prefix = email.split('@')[0][:20]  # First 20 chars of email prefix
    suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(6))
    return f"{prefix}_{suffix}"


def get_tokens_for_user(user: User) -> dict:
    """
    Generate JWT tokens for a user.

    Returns:
        Dict with 'access' and 'refresh' tokens
    """
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def sso_authenticate(request):
    """
    Authenticate user via SSO (Apple or Google).

    This endpoint handles BOTH sign-in and sign-up:
    - If user exists (by sso_id or email): sign in
    - If user doesn't exist: create new user (sign up)

    Request body:
        {
            "provider": "apple" | "google",
            "id_token": "eyJ...",
            "email": "user@example.com",      # Optional, fallback for Apple
            "first_name": "John",             # Optional, from Apple
            "last_name": "Doe"                # Optional, from Apple
        }

    Returns:
        {
            "access": "eyJ...",
            "refresh": "eyJ...",
            "user": { ... }
        }
    """
    provider = request.data.get('provider')
    id_token = request.data.get('id_token')

    # Validate required fields
    if not provider or provider not in ['apple', 'google']:
        return Response(
            {'detail': 'Invalid provider. Must be "apple" or "google".'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not id_token:
        return Response(
            {'detail': 'id_token is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Verify the SSO token
        if settings.DEBUG and request.data.get('dev_mode'):
            # Development mode: skip actual verification
            user_info = verify_sso_token_dev(
                provider=provider,
                id_token=id_token,
                email=request.data.get('email'),
            )
        else:
            user_info = verify_sso_token(provider, id_token)

        # Override with provided name (Apple only sends name on first auth)
        if request.data.get('first_name'):
            user_info.first_name = request.data.get('first_name')
        if request.data.get('last_name'):
            user_info.last_name = request.data.get('last_name')
        if request.data.get('email') and not user_info.email:
            user_info.email = request.data.get('email')

        # Find or create user
        user = find_or_create_user(user_info)

        # Generate JWT tokens
        tokens = get_tokens_for_user(user)

        # Return tokens and user data
        return Response({
            **tokens,
            'user': UserSerializer(user).data,
        })

    except TokenVerificationError as e:
        logger.warning(f'SSO verification failed: {e}')
        return Response(
            {'detail': str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f'SSO authentication error: {e}')
        return Response(
            {'detail': 'Authentication failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def find_or_create_user(user_info: SSOUserInfo) -> User:
    """
    Find existing user or create new one from SSO info.

    Lookup priority:
    1. By sso_provider + sso_id (exact match)
    2. By email (link existing account)

    Args:
        user_info: Verified user info from SSO provider

    Returns:
        User instance
    """
    # Try to find by SSO ID first
    user = User.objects.filter(
        sso_provider=user_info.provider,
        sso_id=user_info.sso_id
    ).first()

    if user:
        logger.info(f'User signed in via {user_info.provider}: {user.email}')
        return user

    # Try to find by email (link account)
    if user_info.email:
        user = User.objects.filter(email=user_info.email).first()
        if user:
            # Link SSO to existing account
            user.sso_provider = user_info.provider
            user.sso_id = user_info.sso_id
            user.save(update_fields=['sso_provider', 'sso_id'])
            logger.info(f'Linked {user_info.provider} to existing user: {user.email}')
            return user

    # Create new user
    username = generate_username(user_info.email or 'user')

    # Ensure unique username
    while User.objects.filter(username=username).exists():
        username = generate_username(user_info.email or 'user')

    user = User.objects.create(
        username=username,
        email=user_info.email,
        first_name=user_info.first_name or '',
        last_name=user_info.last_name or '',
        sso_provider=user_info.provider,
        sso_id=user_info.sso_id,
        # No password for SSO users
    )
    user.set_unusable_password()
    user.save()

    logger.info(f'New user created via {user_info.provider}: {user.email}')
    return user


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current authenticated user's profile.

    Returns:
        User data with profile if exists
    """
    return Response(UserSerializer(request.user).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_current_user(request):
    """
    Update current user's basic info.

    Allowed fields: first_name, last_name

    Returns:
        Updated user data
    """
    user = request.user
    allowed_fields = ['first_name', 'last_name']

    for field in allowed_fields:
        if field in request.data:
            setattr(user, field, request.data[field])

    user.save(update_fields=[f for f in allowed_fields if f in request.data])

    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by blacklisting refresh token.

    Request body:
        {
            "refresh": "eyJ..."
        }
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'detail': 'Successfully logged out.'})
    except Exception:
        return Response({'detail': 'Logout successful.'})
