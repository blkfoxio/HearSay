# Phase 2: Onboarding - COMPLETED

**Status**: ✅ Complete
**Started**: 2025-12-15
**Completed**: 2025-12-15

## Goal

Create the user onboarding flow that collects learning preferences and creates a UserProfile.

## Overview

After SSO authentication, new users (onboarding_completed=false) go through:
1. **Language Selection** - Choose Spanish or French
2. **Proficiency Quiz** - Simple assessment (5 questions)
3. **Personas/Goals** - Select learning goals
4. **Schedule** - Set sessions per week and reminder time

On completion, UserProfile is created and user navigates to Home.

## Completed Tasks

### Mobile Screens

- [x] Language Selection screen - Pick target language
- [x] Proficiency Quiz screen - 5 multiple choice questions
- [x] Personas/Goals screen - Select 1-3 learning goals
- [x] Schedule screen - Sessions per week + reminder time
- [x] Onboarding state management (OnboardingContext)
- [x] Navigation between onboarding screens

### Backend

- [x] Create `onboarding` Django app
- [x] Complete onboarding endpoint (POST) - creates UserProfile
- [x] Update User.onboarding_completed flag
- [x] Added goals JSONField to UserProfile
- [x] Django migrations applied

### Integration

- [x] App.tsx wrapped with OnboardingProvider
- [x] RootNavigator handles onboarding flow based on user state
- [x] ScheduleScreen calls refreshUser() after completion

## Files Created/Modified

### Backend
- `backend/onboarding/` (new app)
- `backend/onboarding/views.py` - Complete onboarding endpoint with proficiency calculation
- `backend/onboarding/urls.py` - URL routes
- `backend/users/models.py` - Added goals JSONField to UserProfile
- `backend/users/migrations/0002_userprofile_goals.py` - Migration
- `backend/config/settings.py` - Added onboarding to INSTALLED_APPS
- `backend/config/urls.py` - Included onboarding.urls

### Mobile
- `mobile/src/screens/onboarding/LanguageScreen.tsx` - Full implementation
- `mobile/src/screens/onboarding/QuizScreen.tsx` - Full implementation with quiz logic
- `mobile/src/screens/onboarding/PersonasScreen.tsx` - Full implementation
- `mobile/src/screens/onboarding/ScheduleScreen.tsx` - Full implementation
- `mobile/src/api/onboarding.ts` - API call to complete onboarding
- `mobile/src/contexts/OnboardingContext.tsx` - Onboarding state management
- `mobile/App.tsx` - Wrapped with OnboardingProvider

## API Endpoints

### POST /api/v1/onboarding/complete/
Submit onboarding data and create UserProfile.

**Request:**
```json
{
  "target_language": "es",
  "quiz_score": 3,
  "goals": ["travel", "conversation"],
  "sessions_per_week": 3,
  "reminder_time": "09:00",
  "notifications_enabled": true
}
```

**Response:**
```json
{
  "user": { ... },
  "profile": {
    "target_language": "es",
    "proficiency_level": "elementary",
    "sessions_per_week": 3,
    "reminder_time": "09:00",
    "goals": ["travel", "conversation"]
  }
}
```

## Proficiency Mapping

Based on quiz score (out of 5):
- 0-1 correct: `beginner`
- 2-3 correct: `elementary`
- 4 correct: `intermediate`
- 5 correct: `upper_intermediate`

## State Management

OnboardingContext holds:
```typescript
{
  targetLanguage: 'es' | 'fr' | null;
  quizAnswers: (number | null)[];
  quizScore: number;
  goals: LearningGoal[];
  sessionsPerWeek: number;
  reminderTime: string | null;
  notificationsEnabled: boolean;
}
```

## Testing Milestone

✅ Complete onboarding flow → UserProfile created in backend
✅ User's onboarding_completed flag set to true
✅ RootNavigator automatically navigates to MainTabs after completion
