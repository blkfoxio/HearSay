# Phase 4: Chunk Lessons

**Status**: ✅ Completed
**Started**: 2025-12-23
**Completed**: 2025-12-23

## Goal

Build chunk/repetition lessons that focus on speaking practice. Users listen to a phrase, record themselves repeating it, compare their recording to the original, and self-assess their confidence.

## Overview

A chunk lesson consists of RepeatSteps:
1. **Listen** - Play the native speaker audio
2. **Record** - User records themselves saying the phrase
3. **Review** - Compare original vs user recording
4. **Rate** - Self-assess confidence (1-5)

## Completed Tasks

### Backend

- [x] Create chunk lesson JSON structure
- [x] Generate TTS audio files for phrases (Spanish & French)
- [x] Store audio in `backend/media/audio/chunks/`
- [x] Add ngrok support for ALLOWED_HOSTS

### Mobile

- [x] Create RepeatStep type definition
- [x] Build RepeatStepView component with 4 phases
- [x] Implement audio playback (expo-av)
- [x] Implement audio recording with permissions
- [x] Add playback comparison (original vs user)
- [x] Build confidence rating UI (emoji buttons)
- [x] Update LessonRunner to handle 'repeat' step type
- [x] Reset state between steps
- [x] Update LessonsListScreen with lesson type indicators
- [x] Fix navigation after lesson completion

### Sample Content

- [x] Spanish chunk lesson: "Cafe Phrases Practice" (5 phrases)
  - Buenos dias, Que desea?, Un cafe con leche por favor, Cuanto es?, Gracias
- [x] French chunk lesson: "Phrases du Cafe" (5 phrases)
  - Bonjour, Qu'est-ce que je vous sers?, Un cafe creme s'il vous plait, C'est combien?, Merci

## RepeatStep JSON Structure

```json
{
  "type": "repeat",
  "id": "chunk1",
  "audioUrl": "/media/audio/chunks/buenos-dias.mp3",
  "phrase": "Buenos dias",
  "translation": "Good morning",
  "phoneticHint": "BWAY-nos DEE-ahs",
  "tip": "This is a formal greeting used until around noon."
}
```

## Files Created/Modified

### Backend
- `backend/media/audio/chunks/*.mp3` - TTS audio files
- `backend/.env` - Added ngrok domains to ALLOWED_HOSTS
- `scripts/generate_chunk_audio.py` - TTS generation script

### Mobile
- `mobile/src/types/index.ts` - Added RepeatStep type
- `mobile/src/components/lesson/RepeatStepView.tsx` - New component
- `mobile/src/components/lesson/LessonRunner.tsx` - Added repeat handling
- `mobile/src/components/lesson/index.ts` - Export RepeatStepView
- `mobile/src/screens/lessons/sampleLessonData.ts` - Added chunk lessons
- `mobile/src/screens/lessons/LessonsListScreen.tsx` - Lesson type UI
- `mobile/src/screens/lessons/LessonCompleteScreen.tsx` - Fixed navigation
- `mobile/src/api/client.ts` - Ngrok URL and headers

## Bug Fixes

- Audio session "background" error - Added staysActiveInBackground: false
- Slider not working in Expo Go - Replaced with button picker
- Step state not resetting - Added useEffect on step.id change
- Navigation GO_BACK error - Use CommonActions.reset()

## Testing Milestone

- [x] Complete chunk lesson with audio recording
- [x] Compare original vs user recording
- [x] Rate confidence and continue
- [x] All 5 phrases work properly
- [x] Navigation returns to lessons list
