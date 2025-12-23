"""
Admin configuration for lesson models.
"""

from django.contrib import admin

from .models import Scenario, Lesson, Attempt


@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'difficulty', 'is_active', 'created_at']
    list_filter = ['language', 'difficulty', 'is_active']
    search_fields = ['title', 'description']
    ordering = ['language', 'difficulty', 'title']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'scenario', 'lesson_type', 'estimated_minutes', 'is_active']
    list_filter = ['lesson_type', 'scenario__language', 'is_active']
    search_fields = ['title', 'description', 'scenario__title']
    ordering = ['scenario', 'order']
    raw_id_fields = ['scenario']


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'score', 'started_at', 'completed_at']
    list_filter = ['completed_at', 'lesson__lesson_type']
    search_fields = ['user__email', 'lesson__title']
    ordering = ['-started_at']
    raw_id_fields = ['user', 'lesson']
    readonly_fields = ['started_at']
