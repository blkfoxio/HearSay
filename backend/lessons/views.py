"""
Lesson API views.
"""

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Scenario, Lesson, Attempt
from .serializers import (
    ScenarioListSerializer,
    LessonListSerializer,
    LessonDetailSerializer,
    AttemptSerializer,
    AttemptCreateSerializer,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def scenario_list(request):
    """
    List all active scenarios.

    Filter by language using ?language=es
    """
    queryset = Scenario.objects.filter(is_active=True)

    # Filter by language if provided
    language = request.query_params.get('language')
    if language:
        queryset = queryset.filter(language=language)

    # Filter by user's target language if no specific language requested
    if not language and hasattr(request.user, 'profile'):
        queryset = queryset.filter(language=request.user.profile.target_language)

    serializer = ScenarioListSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lesson_list(request):
    """
    List all active lessons.

    Filter by scenario using ?scenario=1
    Filter by type using ?type=gist
    Filter by language using ?language=es
    """
    queryset = Lesson.objects.filter(is_active=True).select_related('scenario')

    # Filter by scenario
    scenario_id = request.query_params.get('scenario')
    if scenario_id:
        queryset = queryset.filter(scenario_id=scenario_id)

    # Filter by lesson type
    lesson_type = request.query_params.get('type')
    if lesson_type:
        queryset = queryset.filter(lesson_type=lesson_type)

    # Filter by language
    language = request.query_params.get('language')
    if language:
        queryset = queryset.filter(scenario__language=language)

    # Filter by user's target language if no specific language requested
    if not language and not scenario_id and hasattr(request.user, 'profile'):
        queryset = queryset.filter(scenario__language=request.user.profile.target_language)

    serializer = LessonListSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lesson_detail(request, lesson_id):
    """
    Get lesson details including steps.
    """
    try:
        lesson = Lesson.objects.select_related('scenario').get(
            id=lesson_id,
            is_active=True
        )
    except Lesson.DoesNotExist:
        return Response(
            {'detail': 'Lesson not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = LessonDetailSerializer(lesson)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lesson_attempts(request, lesson_id):
    """
    GET: List user's attempts for this lesson.
    POST: Record a completed attempt.
    """
    try:
        lesson = Lesson.objects.get(id=lesson_id, is_active=True)
    except Lesson.DoesNotExist:
        return Response(
            {'detail': 'Lesson not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        attempts = Attempt.objects.filter(
            user=request.user,
            lesson=lesson
        ).order_by('-started_at')[:10]
        serializer = AttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = AttemptCreateSerializer(data=request.data)
        if serializer.is_valid():
            attempt = serializer.save(
                user=request.user,
                lesson=lesson,
                completed_at=timezone.now()
            )

            # Update user profile stats if available
            if hasattr(request.user, 'profile'):
                profile = request.user.profile
                profile.total_lessons_completed += 1
                if attempt.duration_seconds:
                    profile.total_practice_minutes += attempt.duration_seconds // 60
                profile.last_activity_date = timezone.now().date()
                profile.save()

            return Response(
                AttemptSerializer(attempt).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_plan(request):
    """
    Get today's recommended lessons.

    For MVP, this returns available lessons for the user's language.
    Later phases will add adaptive learning logic.
    """
    user = request.user

    # Get user's target language
    target_language = 'es'  # Default to Spanish
    if hasattr(user, 'profile') and user.profile.target_language:
        target_language = user.profile.target_language

    # Get available lessons for the user's language
    lessons = Lesson.objects.filter(
        is_active=True,
        scenario__is_active=True,
        scenario__language=target_language
    ).select_related('scenario').order_by('scenario__difficulty', 'order')[:5]

    # Count completed lessons today
    today = timezone.now().date()
    completed_today = Attempt.objects.filter(
        user=user,
        completed_at__date=today
    ).count()

    # Calculate total estimated time
    total_minutes = sum(lesson.estimated_minutes for lesson in lessons)

    return Response({
        'lessons': LessonListSerializer(lessons, many=True).data,
        'total_minutes': total_minutes,
        'completed_today': completed_today,
        'target_language': target_language,
    })
