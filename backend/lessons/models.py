"""
Lesson models for HearSay.

Scenarios contain lessons, which are made up of steps.
Attempts track user progress through lessons.
"""

from django.conf import settings
from django.db import models


class Scenario(models.Model):
    """
    A learning scenario/context (e.g., "Ordering at a café").

    Scenarios group related lessons together and provide context.
    """

    title = models.CharField(
        max_length=200,
        help_text="Scenario title (e.g., 'At the Café')"
    )
    description = models.TextField(
        help_text="Detailed description of the scenario"
    )
    context_tags = models.JSONField(
        default=list,
        help_text="Context tags (e.g., ['travel', 'food'])"
    )
    language = models.CharField(
        max_length=5,
        help_text="Target language code (e.g., 'es', 'fr')"
    )
    difficulty = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('elementary', 'Elementary'),
            ('intermediate', 'Intermediate'),
            ('upper_intermediate', 'Upper Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='beginner',
        help_text="Difficulty level"
    )
    image_url = models.URLField(
        blank=True,
        null=True,
        help_text="Optional scenario image URL"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this scenario is available to users"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Scenario'
        verbose_name_plural = 'Scenarios'
        ordering = ['language', 'difficulty', 'title']

    def __str__(self):
        return f"{self.title} ({self.language})"


class Lesson(models.Model):
    """
    A single lesson within a scenario.

    Lessons consist of steps (audio, questions, reveals) stored as JSON.
    """

    class LessonType(models.TextChoices):
        GIST = 'gist', 'Gist'  # Listening comprehension
        CHUNK = 'chunk', 'Chunk'  # Repetition/speaking practice
        ROLEPLAY = 'roleplay', 'Roleplay'  # Interactive roleplay

    scenario = models.ForeignKey(
        Scenario,
        on_delete=models.CASCADE,
        related_name='lessons',
        help_text="Parent scenario"
    )
    lesson_type = models.CharField(
        max_length=20,
        choices=LessonType.choices,
        help_text="Type of lesson"
    )
    title = models.CharField(
        max_length=200,
        help_text="Lesson title"
    )
    description = models.TextField(
        blank=True,
        help_text="Brief description of what the user will learn"
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Order within scenario (lower = first)"
    )
    steps = models.JSONField(
        default=list,
        help_text="Array of lesson step objects"
    )
    estimated_minutes = models.PositiveSmallIntegerField(
        default=5,
        help_text="Estimated time to complete in minutes"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this lesson is available"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'
        ordering = ['scenario', 'order', 'created_at']

    def __str__(self):
        return f"{self.title} ({self.get_lesson_type_display()})"

    @property
    def step_count(self):
        """Return the number of steps in this lesson."""
        return len(self.steps) if self.steps else 0

    @property
    def question_count(self):
        """Return the number of question steps in this lesson."""
        if not self.steps:
            return 0
        return sum(1 for step in self.steps if step.get('type') == 'question')


class Attempt(models.Model):
    """
    Records a user's attempt at completing a lesson.

    Tracks start/end time, score, and individual responses.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lesson_attempts',
        help_text="User who made the attempt"
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='attempts',
        help_text="Lesson attempted"
    )
    started_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the attempt started"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the attempt was completed"
    )
    score = models.FloatField(
        null=True,
        blank=True,
        help_text="Score as decimal (0.0 - 1.0)"
    )
    responses = models.JSONField(
        default=list,
        help_text="Array of user responses to steps"
    )
    duration_seconds = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Time spent on lesson in seconds"
    )

    class Meta:
        verbose_name = 'Attempt'
        verbose_name_plural = 'Attempts'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'lesson']),
            models.Index(fields=['user', '-started_at']),
        ]

    def __str__(self):
        status = "completed" if self.completed_at else "in progress"
        return f"{self.user.email} - {self.lesson.title} ({status})"

    @property
    def is_completed(self):
        """Check if this attempt is completed."""
        return self.completed_at is not None

    @property
    def correct_count(self):
        """Count correct responses."""
        if not self.responses:
            return 0
        return sum(1 for r in self.responses if r.get('correct', False))

    @property
    def total_questions(self):
        """Count total question responses."""
        if not self.responses:
            return 0
        return len(self.responses)
