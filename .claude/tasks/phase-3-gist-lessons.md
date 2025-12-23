# Phase 3: First Lesson Type - Gist

**Status**: 🔄 In Progress
**Started**: 2025-12-15

## Goal

Build one complete "gist" lesson working end-to-end. Gist lessons focus on listening comprehension - users listen to a dialogue and answer questions about what they understood.

## Overview

A gist lesson consists of steps:
1. **AudioStep** - Play a dialogue/conversation
2. **QuestionStep** - Ask comprehension questions (multiple choice)
3. **RevealStep** - Show correct answer with transcript

## Tasks

### Backend

- [ ] Create `lessons` Django app
- [ ] Create models: Scenario, Lesson, LessonStep, Attempt
- [ ] Create one hardcoded gist lesson JSON
- [ ] Build `/api/v1/lessons/` list endpoint
- [ ] Build `/api/v1/lessons/{id}/` detail endpoint
- [ ] Build `/api/v1/lessons/{id}/attempts/` POST endpoint
- [ ] Build `/api/v1/plan/today/` endpoint (returns today's lesson)

### Mobile

- [ ] Create lesson types and interfaces
- [ ] Build LessonRunner component (processes step JSON)
- [ ] Build AudioStep component (play audio, replay controls)
- [ ] Build QuestionStep component (multiple choice)
- [ ] Build RevealStep component (show answer, transcript)
- [ ] Build LessonCompleteScreen
- [ ] Create lessons API module
- [ ] Wire up HomeScreen to fetch and start lessons

### Audio

- [ ] Generate test audio files (Spanish café dialogue)
- [ ] Store in `backend/media/audio/`

## Data Models

### Scenario
```python
class Scenario(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    context_tags = models.JSONField(default=list)  # ['travel', 'food']
    language = models.CharField(max_length=5)  # 'es', 'fr'
    difficulty = models.CharField(max_length=20)  # beginner, intermediate, etc.
```

### Lesson
```python
class Lesson(models.Model):
    class LessonType(models.TextChoices):
        GIST = 'gist', 'Gist'
        CHUNK = 'chunk', 'Chunk'
        ROLEPLAY = 'roleplay', 'Roleplay'

    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE)
    lesson_type = models.CharField(max_length=20, choices=LessonType.choices)
    title = models.CharField(max_length=200)
    steps = models.JSONField()  # Array of step objects
    estimated_minutes = models.PositiveSmallIntegerField(default=5)
```

### Attempt
```python
class Attempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)
    score = models.FloatField(null=True)  # 0.0 - 1.0
    responses = models.JSONField(default=list)  # User's answers
```

## Lesson Step JSON Structure

```json
{
  "steps": [
    {
      "type": "audio",
      "id": "intro",
      "audio_url": "/media/audio/cafe-dialogue-1.mp3",
      "title": "Listen to the conversation",
      "description": "A customer ordering at a café in Madrid"
    },
    {
      "type": "question",
      "id": "q1",
      "question": "What did the customer order?",
      "options": [
        "Coffee and a croissant",
        "Tea and a sandwich",
        "Water and cake",
        "Just coffee"
      ],
      "correct_index": 0,
      "audio_url": "/media/audio/cafe-dialogue-1.mp3"
    },
    {
      "type": "reveal",
      "id": "r1",
      "correct_answer": "Coffee and a croissant",
      "transcript": "Cliente: Hola, buenos días...",
      "translation": "Customer: Hello, good morning...",
      "explanation": "The customer said 'un café y un croissant'"
    }
  ]
}
```

## API Endpoints

### GET /api/v1/lessons/
List available lessons for the user.

### GET /api/v1/lessons/{id}/
Get lesson details including steps.

### POST /api/v1/lessons/{id}/attempts/
Record a lesson attempt.

**Request:**
```json
{
  "score": 0.8,
  "responses": [
    {"step_id": "q1", "selected_index": 0, "correct": true},
    {"step_id": "q2", "selected_index": 2, "correct": false}
  ],
  "duration_seconds": 180
}
```

### GET /api/v1/plan/today/
Get today's recommended lesson(s).

## Screen Flow

```
HomeScreen
    ↓ (tap "Start Lesson")
LessonScreen
    ↓
LessonRunner (processes steps)
    → AudioStep (plays audio)
    → QuestionStep (shows question)
    → RevealStep (shows answer)
    ↓
LessonCompleteScreen
    ↓ (tap "Done")
HomeScreen (updated)
```

## Files to Create/Modify

### Backend
- `backend/lessons/` (new app)
- `backend/lessons/models.py` - Scenario, Lesson, Attempt
- `backend/lessons/views.py` - API endpoints
- `backend/lessons/urls.py` - URL routes
- `backend/lessons/serializers.py` - DRF serializers
- `backend/lessons/fixtures/` - Sample lesson data
- `backend/media/audio/` - Test audio files

### Mobile
- `mobile/src/types/lesson.ts` - Lesson type definitions
- `mobile/src/api/lessons.ts` - Lesson API calls
- `mobile/src/screens/lessons/LessonScreen.tsx` - Lesson container
- `mobile/src/components/lessons/LessonRunner.tsx` - Step processor
- `mobile/src/components/lessons/AudioStep.tsx` - Audio playback
- `mobile/src/components/lessons/QuestionStep.tsx` - Multiple choice
- `mobile/src/components/lessons/RevealStep.tsx` - Answer reveal
- `mobile/src/screens/lessons/LessonCompleteScreen.tsx` - Completion

## Testing Milestone

✅ Play through one complete gist lesson
✅ See attempt recorded in Django admin
✅ HomeScreen shows lesson available
