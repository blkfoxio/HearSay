"""
Serializers for User and UserProfile models.
"""

from rest_framework import serializers

from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""

    class Meta:
        model = UserProfile
        fields = [
            'target_language',
            'native_language',
            'proficiency_level',
            'sessions_per_week',
            'session_duration_minutes',
            'notifications_enabled',
            'reminder_time',
            'timezone',
            'total_lessons_completed',
            'total_practice_minutes',
            'current_streak_days',
            'longest_streak_days',
            'last_activity_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'total_lessons_completed',
            'total_practice_minutes',
            'current_streak_days',
            'longest_streak_days',
            'last_activity_date',
            'created_at',
            'updated_at',
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'sso_provider',
            'onboarding_completed',
            'profile',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'email',
            'sso_provider',
            'created_at',
            'updated_at',
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating UserProfile."""

    class Meta:
        model = UserProfile
        fields = [
            'target_language',
            'native_language',
            'proficiency_level',
            'sessions_per_week',
            'session_duration_minutes',
            'notifications_enabled',
            'reminder_time',
            'timezone',
        ]
