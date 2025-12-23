"""
Admin configuration for User and UserProfile models.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    """Inline admin for UserProfile on User admin page."""

    model = UserProfile
    can_delete = False
    verbose_name = 'Profile'
    verbose_name_plural = 'Profile'
    fk_name = 'user'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin with SSO and profile fields."""

    list_display = (
        'email',
        'username',
        'sso_provider',
        'onboarding_completed',
        'is_active',
        'created_at',
    )
    list_filter = (
        'sso_provider',
        'onboarding_completed',
        'is_active',
        'is_staff',
    )
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('SSO Information', {
            'fields': ('sso_provider', 'sso_id'),
        }),
        ('Onboarding', {
            'fields': ('onboarding_completed',),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('SSO Information', {
            'fields': ('sso_provider', 'sso_id'),
        }),
    )

    inlines = [UserProfileInline]


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin for UserProfile model."""

    list_display = (
        'user',
        'target_language',
        'proficiency_level',
        'total_lessons_completed',
        'current_streak_days',
    )
    list_filter = (
        'target_language',
        'proficiency_level',
        'notifications_enabled',
    )
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('User', {
            'fields': ('user',),
        }),
        ('Language Settings', {
            'fields': ('target_language', 'native_language', 'proficiency_level'),
        }),
        ('Learning Preferences', {
            'fields': ('sessions_per_week', 'session_duration_minutes'),
        }),
        ('Notifications', {
            'fields': ('notifications_enabled', 'reminder_time', 'timezone'),
        }),
        ('Progress', {
            'fields': (
                'total_lessons_completed',
                'total_practice_minutes',
                'current_streak_days',
                'longest_streak_days',
                'last_activity_date',
            ),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
