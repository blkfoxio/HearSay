"""
Onboarding views.

Handles onboarding completion and profile creation.
"""

import logging
from datetime import time

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.models import UserProfile
from users.serializers import UserSerializer, UserProfileSerializer

logger = logging.getLogger('hearsay')


def calculate_proficiency(quiz_score: int) -> str:
    """
    Calculate proficiency level based on quiz score (out of 5).

    Score mapping:
    - 0-1: beginner
    - 2-3: elementary
    - 4: intermediate
    - 5: upper_intermediate
    """
    if quiz_score <= 1:
        return 'beginner'
    elif quiz_score <= 3:
        return 'elementary'
    elif quiz_score == 4:
        return 'intermediate'
    else:
        return 'upper_intermediate'


def parse_time(time_str: str | None) -> time | None:
    """Parse time string (HH:MM) to time object."""
    if not time_str:
        return None
    try:
        parts = time_str.split(':')
        return time(int(parts[0]), int(parts[1]))
    except (ValueError, IndexError):
        return None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_onboarding(request):
    """
    Complete onboarding and create user profile.

    Request body:
        {
            "target_language": "es" | "fr",
            "quiz_score": 0-5,
            "goals": ["travel", "work", ...],
            "sessions_per_week": 1-7,
            "reminder_time": "HH:MM" | null,
            "notifications_enabled": true | false
        }

    Returns:
        {
            "user": { ... },
            "profile": { ... }
        }
    """
    user = request.user

    # Check if already completed
    if user.onboarding_completed:
        return Response(
            {'detail': 'Onboarding already completed.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate required fields
    target_language = request.data.get('target_language')
    if not target_language or target_language not in ['es', 'fr']:
        return Response(
            {'detail': 'Invalid target_language. Must be "es" or "fr".'},
            status=status.HTTP_400_BAD_REQUEST
        )

    quiz_score = request.data.get('quiz_score', 0)
    if not isinstance(quiz_score, int) or quiz_score < 0 or quiz_score > 5:
        return Response(
            {'detail': 'Invalid quiz_score. Must be integer 0-5.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    goals = request.data.get('goals', [])
    if not isinstance(goals, list):
        return Response(
            {'detail': 'Invalid goals. Must be a list.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    sessions_per_week = request.data.get('sessions_per_week', 3)
    if not isinstance(sessions_per_week, int) or sessions_per_week < 1 or sessions_per_week > 7:
        sessions_per_week = 3

    notifications_enabled = request.data.get('notifications_enabled', True)
    reminder_time_str = request.data.get('reminder_time')
    reminder_time = parse_time(reminder_time_str)

    # Calculate proficiency from quiz score
    proficiency_level = calculate_proficiency(quiz_score)

    try:
        # Create or update UserProfile
        profile, created = UserProfile.objects.update_or_create(
            user=user,
            defaults={
                'target_language': target_language,
                'proficiency_level': proficiency_level,
                'goals': goals,
                'sessions_per_week': sessions_per_week,
                'notifications_enabled': notifications_enabled,
                'reminder_time': reminder_time,
            }
        )

        # Mark onboarding as completed
        user.onboarding_completed = True
        user.save(update_fields=['onboarding_completed'])

        logger.info(f'Onboarding completed for user: {user.email}')

        return Response({
            'user': UserSerializer(user).data,
            'profile': UserProfileSerializer(profile).data,
        })

    except Exception as e:
        logger.error(f'Onboarding completion error: {e}')
        return Response(
            {'detail': 'Failed to complete onboarding. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
