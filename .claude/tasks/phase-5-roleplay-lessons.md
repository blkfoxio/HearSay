# Phase 5: Roleplay Lessons

**Status**: Completed
**Started**: 2025-12-23
**Completed**: 2025-12-23

## Goal

Build roleplay lessons where users respond to prompts in a conversational context. Users hear a prompt, record their spoken response, and receive feedback with suggested rewrites.

## Overview

A roleplay lesson consists of RoleplaySteps:
1. **Listen** - Play the prompt audio (e.g., what someone says to you)
2. **Respond** - User records their free-form spoken response
3. **Feedback** - Display feedback with suggested phrases/rewrites

## Completed Tasks

### Mobile

- [x] Create RoleplayStep type definition (`mobile/src/types/index.ts`)
- [x] Build RoleplayStepView component (`mobile/src/components/lesson/RoleplayStepView.tsx`)
- [x] Implement audio playback for prompts
- [x] Implement voice recording for free-form response
- [x] Display feedback/rewrite suggestions UI
- [x] Update LessonRunner to handle 'roleplay' step type
- [x] Export RoleplayStepView from index
- [x] Add roleplay lessons to sample data
- [x] Update LessonsListScreen with roleplay type indicators

### Backend

- [x] Create roleplay audio directory (`backend/media/audio/roleplay/`)
- [x] Create TTS generation script (`scripts/generate_roleplay_audio.py`)
- [x] Generate TTS audio files

### Sample Content

- [x] Spanish roleplay lesson: "Cafe Conversation Practice" (3 prompts)
  - Ordering coffee, asking about pastries, paying
- [x] French roleplay lesson: "Conversation au Cafe" (3 prompts)
  - Greeting and ordering, asking about food, asking for bill

## RoleplayStep JSON Structure

```json
{
  "type": "roleplay",
  "id": "roleplay1",
  "promptAudioUrl": "/media/audio/roleplay/es-cafe-prompt-1.mp3",
  "situation": "You've just walked into a cozy cafe in Barcelona...",
  "prompt": "\"¡Buenos días! ¿Qué le puedo servir?\"",
  "promptTranslation": "Good morning! What can I serve you?",
  "taskInstruction": "Greet the waiter and order a coffee with milk.",
  "suggestedResponses": [
    {
      "phrase": "¡Buenos días! Un café con leche, por favor.",
      "translation": "Good morning! A coffee with milk, please."
    }
  ],
  "tip": "Remember to greet back before placing your order!"
}
```

## Files Created/Modified

### Mobile
- `mobile/src/types/index.ts` - Added RoleplayStep, SuggestedResponse types
- `mobile/src/components/lesson/RoleplayStepView.tsx` - New component
- `mobile/src/components/lesson/LessonRunner.tsx` - Added roleplay handling
- `mobile/src/components/lesson/index.ts` - Export RoleplayStepView
- `mobile/src/screens/lessons/sampleLessonData.ts` - Added 2 roleplay lessons
- `mobile/src/screens/lessons/LessonsListScreen.tsx` - Roleplay UI indicators

### Backend
- `backend/media/audio/roleplay/*.mp3` - TTS prompt audio files
- `scripts/generate_roleplay_audio.py` - TTS generation script

## Testing Milestone

- [x] Complete roleplay lesson with voice recording
- [x] View feedback and suggested responses
- [x] All prompts play correctly
- [x] Compare playback of prompt and recording works
- [x] Navigation between steps works
- [x] Navigation after lesson completion works
