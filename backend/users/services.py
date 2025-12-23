"""
Authentication services for SSO token verification.

Handles Apple and Google ID token verification.
"""

import logging
import requests
from typing import Optional
from dataclasses import dataclass

from django.conf import settings
from jose import jwt, JWTError

logger = logging.getLogger('hearsay')


@dataclass
class SSOUserInfo:
    """User info extracted from SSO token."""
    provider: str
    sso_id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class TokenVerificationError(Exception):
    """Raised when token verification fails."""
    pass


def verify_apple_token(id_token: str) -> SSOUserInfo:
    """
    Verify Apple ID token and extract user info.

    Apple uses RS256 algorithm with rotating public keys.

    Args:
        id_token: The ID token from Apple Sign-In

    Returns:
        SSOUserInfo with user details

    Raises:
        TokenVerificationError: If verification fails
    """
    try:
        # Fetch Apple's public keys
        apple_keys_url = 'https://appleid.apple.com/auth/keys'
        response = requests.get(apple_keys_url, timeout=10)
        response.raise_for_status()
        apple_keys = response.json()

        # Get the key ID from the token header
        unverified_header = jwt.get_unverified_header(id_token)
        kid = unverified_header.get('kid')

        # Find the matching key
        key = None
        for k in apple_keys.get('keys', []):
            if k.get('kid') == kid:
                key = k
                break

        if not key:
            raise TokenVerificationError('Apple public key not found')

        # Verify and decode the token
        # In development, we may not have APPLE_CLIENT_ID configured
        audience = settings.APPLE_CLIENT_ID or 'com.hearsay.app'

        payload = jwt.decode(
            id_token,
            key,
            algorithms=['RS256'],
            audience=audience,
            issuer='https://appleid.apple.com',
        )

        # Extract user info
        return SSOUserInfo(
            provider='apple',
            sso_id=payload['sub'],
            email=payload.get('email', ''),
            # Note: Apple only provides name on first sign-in
            # It's passed separately in the authorization response
        )

    except JWTError as e:
        logger.error(f'Apple token verification failed: {e}')
        raise TokenVerificationError(f'Invalid Apple token: {e}')
    except requests.RequestException as e:
        logger.error(f'Failed to fetch Apple keys: {e}')
        raise TokenVerificationError('Failed to verify Apple token')


def verify_google_token(id_token: str) -> SSOUserInfo:
    """
    Verify Google ID token and extract user info.

    Uses Google's tokeninfo endpoint for verification.

    Args:
        id_token: The ID token from Google Sign-In

    Returns:
        SSOUserInfo with user details

    Raises:
        TokenVerificationError: If verification fails
    """
    try:
        # Use Google's tokeninfo endpoint
        google_url = f'https://oauth2.googleapis.com/tokeninfo?id_token={id_token}'
        response = requests.get(google_url, timeout=10)

        if response.status_code != 200:
            raise TokenVerificationError('Invalid Google token')

        payload = response.json()

        # Verify audience (client ID)
        # In development, we may not have GOOGLE_CLIENT_ID configured
        expected_audience = settings.GOOGLE_CLIENT_ID
        if expected_audience and payload.get('aud') != expected_audience:
            raise TokenVerificationError('Invalid Google token audience')

        # Verify issuer
        if payload.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
            raise TokenVerificationError('Invalid Google token issuer')

        # Extract user info
        return SSOUserInfo(
            provider='google',
            sso_id=payload['sub'],
            email=payload.get('email', ''),
            first_name=payload.get('given_name'),
            last_name=payload.get('family_name'),
        )

    except requests.RequestException as e:
        logger.error(f'Google token verification failed: {e}')
        raise TokenVerificationError('Failed to verify Google token')


def verify_sso_token(provider: str, id_token: str) -> SSOUserInfo:
    """
    Verify SSO token based on provider.

    Args:
        provider: 'apple' or 'google'
        id_token: The ID token from the SSO provider

    Returns:
        SSOUserInfo with user details

    Raises:
        TokenVerificationError: If verification fails
        ValueError: If provider is not supported
    """
    if provider == 'apple':
        return verify_apple_token(id_token)
    elif provider == 'google':
        return verify_google_token(id_token)
    else:
        raise ValueError(f'Unsupported SSO provider: {provider}')


# Development mode: Skip actual token verification
def verify_sso_token_dev(provider: str, id_token: str, email: str = None) -> SSOUserInfo:
    """
    Development-only token verification that skips actual verification.

    WARNING: Only use in DEBUG mode for testing!

    Args:
        provider: 'apple' or 'google'
        id_token: The ID token (used as sso_id in dev mode)
        email: Email address (required in dev mode)

    Returns:
        SSOUserInfo with mock user details
    """
    if not settings.DEBUG:
        raise TokenVerificationError('Dev verification not allowed in production')

    logger.warning('Using development token verification - NOT FOR PRODUCTION')

    return SSOUserInfo(
        provider=provider,
        sso_id=f'dev_{id_token[:20]}' if id_token else 'dev_test_user',
        email=email or 'dev@example.com',
        first_name='Dev',
        last_name='User',
    )
