"""
User and UserProfile models for HearSay.

Custom User model with SSO provider tracking.
UserProfile stores learning preferences and settings.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.

    Adds SSO provider tracking for Apple/Google sign-in.
    """

    class SSOProvider(models.TextChoices):
        APPLE = 'apple', 'Apple'
        GOOGLE = 'google', 'Google'
        EMAIL = 'email', 'Email'  # For potential future email auth

    # SSO fields
    sso_provider = models.CharField(
        max_length=10,
        choices=SSOProvider.choices,
        null=True,
        blank=True,
        help_text="OAuth provider used for authentication"
    )
    sso_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        unique=True,
        help_text="Unique identifier from SSO provider"
    )

    # Override email to make it unique and required
    email = models.EmailField(
        unique=True,
        help_text="User's email address"
    )

    # Profile completion tracking
    onboarding_completed = models.BooleanField(
        default=False,
        help_text="Whether user has completed onboarding flow"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as the primary identifier for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['sso_provider', 'sso_id']),
        ]

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    """
    Extended profile data for learning preferences.

    Created after onboarding quiz completion.
    """

    class TargetLanguage(models.TextChoices):
        SPANISH = 'es', 'Spanish'
        FRENCH = 'fr', 'French'

    class ProficiencyLevel(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        ELEMENTARY = 'elementary', 'Elementary'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        UPPER_INTERMEDIATE = 'upper_intermediate', 'Upper Intermediate'
        ADVANCED = 'advanced', 'Advanced'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    # Language settings
    target_language = models.CharField(
        max_length=5,
        choices=TargetLanguage.choices,
        help_text="Language the user is learning"
    )
    native_language = models.CharField(
        max_length=5,
        default='en',
        help_text="User's native language"
    )

    # Proficiency (set based on quiz results)
    proficiency_level = models.CharField(
        max_length=20,
        choices=ProficiencyLevel.choices,
        default=ProficiencyLevel.BEGINNER,
        help_text="Current proficiency level"
    )

    # Learning goals (stored as JSON array)
    goals = models.JSONField(
        default=list,
        help_text="Learning goals selected during onboarding"
    )

    # Learning preferences
    sessions_per_week = models.PositiveSmallIntegerField(
        default=3,
        help_text="Target learning sessions per week"
    )
    session_duration_minutes = models.PositiveSmallIntegerField(
        default=15,
        help_text="Preferred session duration in minutes"
    )

    # Notification preferences
    notifications_enabled = models.BooleanField(
        default=True,
        help_text="Whether push notifications are enabled"
    )
    reminder_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Preferred time for daily reminder"
    )
    timezone = models.CharField(
        max_length=50,
        default='UTC',
        help_text="User's timezone for scheduling"
    )

    # Progress tracking
    total_lessons_completed = models.PositiveIntegerField(default=0)
    total_practice_minutes = models.PositiveIntegerField(default=0)
    current_streak_days = models.PositiveIntegerField(default=0)
    longest_streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"Profile for {self.user.email}"
