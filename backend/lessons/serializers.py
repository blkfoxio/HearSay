"""
Serializers for lesson API endpoints.
"""

from rest_framework import serializers

from .models import Scenario, Lesson, Attempt


class ScenarioListSerializer(serializers.ModelSerializer):
    """Serializer for scenario list view."""

    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Scenario
        fields = [
            'id',
            'title',
            'description',
            'context_tags',
            'language',
            'difficulty',
            'image_url',
            'lesson_count',
        ]

    def get_lesson_count(self, obj):
        return obj.lessons.filter(is_active=True).count()


class LessonListSerializer(serializers.ModelSerializer):
    """Serializer for lesson list view (without steps)."""

    scenario_title = serializers.CharField(source='scenario.title', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id',
            'scenario',
            'scenario_title',
            'lesson_type',
            'title',
            'description',
            'estimated_minutes',
            'step_count',
            'question_count',
        ]


class LessonDetailSerializer(serializers.ModelSerializer):
    """Serializer for lesson detail view (includes steps)."""

    scenario_title = serializers.CharField(source='scenario.title', read_only=True)
    scenario_description = serializers.CharField(source='scenario.description', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id',
            'scenario',
            'scenario_title',
            'scenario_description',
            'lesson_type',
            'title',
            'description',
            'steps',
            'estimated_minutes',
            'step_count',
            'question_count',
        ]


class AttemptSerializer(serializers.ModelSerializer):
    """Serializer for attempt records."""

    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = Attempt
        fields = [
            'id',
            'lesson',
            'lesson_title',
            'started_at',
            'completed_at',
            'score',
            'responses',
            'duration_seconds',
            'is_completed',
            'correct_count',
            'total_questions',
        ]
        read_only_fields = ['id', 'started_at', 'is_completed', 'correct_count', 'total_questions']


class AttemptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/completing an attempt."""

    class Meta:
        model = Attempt
        fields = [
            'score',
            'responses',
            'duration_seconds',
        ]

    def create(self, validated_data):
        """Create a completed attempt."""
        from django.utils import timezone

        validated_data['completed_at'] = timezone.now()
        return super().create(validated_data)


class TodayPlanSerializer(serializers.Serializer):
    """Serializer for today's learning plan."""

    lessons = LessonListSerializer(many=True)
    total_minutes = serializers.IntegerField()
    completed_today = serializers.IntegerField()
