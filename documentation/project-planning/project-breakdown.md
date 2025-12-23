# HearSay - Project Breakdown

## Repository Structure

Start with 1 monorepo, split later if needed:

```
hearsay/
├── backend/          # Django + DRF
├── mobile/           # React Native + Expo
├── scripts/          # Shared utilities, seed data generation
├── docs/             # Your spec, API docs, notes
└── README.md
```

### Why monorepo for MVP:

- Easier to manage solo
- Share types/constants between frontend and backend
- Simpler version control
- Can split later if needed

---

## Cost-Effective Infrastructure for MVP

Instead of full AWS, recommended services:

### Backend Hosting

**Render.com** (Free tier) or **Railway.app** (Free $5/month credit)

- Hosts Django + PostgreSQL
- Free SSL
- Easy deploys from GitHub
- No AWS complexity

### Database

**PostgreSQL on Render/Railway** (free tier)

- 1GB storage (plenty for MVP)
- Automatic backups

### File Storage (Audio)

**Cloudflare R2** (Free 10GB storage, free egress)

- S3-compatible API
- Much cheaper than S3
- OR **Supabase Storage** (free 1GB)

### Background Jobs

**Django-Q** with Django ORM broker (simpler than Celery+Redis for MVP)

- No separate Redis/SQS needed
- Good enough for MVP scale

### Email

**Resend** (free 100 emails/day) or **SendGrid** (free 100/day)

- Simpler than SES for MVP

### Monitoring

- **Sentry** (free tier) for error tracking
- Render/Railway built-in logs (no CloudWatch needed)

**Estimated monthly cost: $0-10 for MVP** vs $50+ for AWS setup

---

## Development Phases

### Phase 0: Project Setup (2-3 days) (Completed)

**Goal:** Get basic structure running locally

#### Backend tasks:

1. Create Django project with basic structure
2. Set up PostgreSQL locally (or use SQLite for now)
3. Configure Django settings for dev/prod
4. Create initial models: User, UserProfile
5. Set up Django REST Framework
6. Add django-cors-headers

#### Mobile tasks:

1. Initialize Expo project with TypeScript
2. Set up folder structure from spec
3. Install core dependencies (navigation, auth)
4. Create basic navigation shell
5. Test app runs on iOS/Android simulator

#### Claude Code prompts:

```
"Set up Django project with DRF, configure for separate frontend, include User model and basic API structure"

"Initialize Expo TypeScript project with folder structure for auth, screens, navigation, and API client"
```

---

### Phase 1: Authentication (3-4 days) (Completed)

**Goal:** Sign in with Apple + Google working end-to-end

#### Backend:

1. Install `python-jose`, `requests` for token verification
2. Create `/api/v1/auth/sso/` endpoint
3. Add Apple ID token verification
4. Add Google ID token verification
5. Set up Django SimpleJWT
6. Return access + refresh tokens

#### Mobile:

1. Install `expo-apple-authentication`, `expo-auth-session`
2. Build WelcomeScreen with SSO buttons
3. Implement Apple sign-in flow
4. Implement Google sign-in flow
5. Store tokens in SecureStore
6. Create useAuth hook
7. Add token refresh logic

#### Claude Code prompts:

```
"Create Django endpoint for SSO authentication that verifies Apple and Google ID tokens, creates/finds users, returns JWT tokens"

"Build React Native authentication flow with Apple and Google sign-in using Expo, store tokens securely, create useAuth context"
```

**Testing milestone:** Sign in on mobile → see user created in Django admin

---

### Phase 2: Onboarding Flow (3-4 days) (Completed)

**Goal:** Complete onboarding saves user profile

#### Backend:

1. Create models: ContextTag, Persona, IntentTag
2. Seed initial contexts and personas
3. Create quiz questions JSON structure
4. Build `/api/v1/onboarding/quiz/` endpoint
5. Build `/api/v1/onboarding/quiz/submit/` endpoint
6. Build `/api/v1/me/profile/` PATCH endpoint

#### Mobile:

1. LanguageScreen (Spanish/French selection)
2. QuizScreen (fetch questions, collect answers)
3. PersonasScreen (display and select)
4. ScheduleScreen (sessions per week)
5. Navigation flow through all screens
6. Submit profile to backend

#### Claude Code prompts:

```
"Create Django models for ContextTag, Persona, IntentTag with M2M relationships to UserProfile. Add quiz endpoint that returns questions and scores answers"

"Build React Native onboarding flow: language selection, quiz with multiple choice questions, persona selection, schedule preference. Submit to backend API"
```

**Testing milestone:** Complete onboarding → see profile data in Django admin

---

### Phase 3: First Lesson Type - Gist (4-5 days) (Completed)

**Goal:** One complete gist lesson works end-to-end

#### Backend:

1. Create models: Scenario, Lesson, Attempt
2. Create one hardcoded gist lesson JSON
3. Build `/api/v1/lessons/{id}/` endpoint
4. Build `/api/v1/lessons/{id}/attempts/` endpoint
5. Build `/api/v1/plan/today/` endpoint (returns hardcoded lesson)

#### Mobile:

1. Build LessonRunner component
2. Implement AudioStep (play audio, replay controls)
3. Implement QuestionStep (multiple choice)
4. Implement RevealStep (show answer, transcript)
5. Build lesson completion screen
6. Post attempt data to backend
7. Wire up HomeScreen to fetch today's lesson

#### Audio for testing:

- Use Google Text-to-Speech API (free) or ElevenLabs (free tier)
- Generate 2-3 simple French/Spanish audio clips
- Store in `/backend/media/` for now (move to R2 later)

#### Claude Code prompts:

```
"Create Django models for Scenario and Lesson with JSON field for steps. Add endpoints to retrieve lesson and record attempts"

"Build React Native lesson runner that processes step JSON: AudioStep with audio playback, QuestionStep with multiple choice, RevealStep showing answers"
```

**Testing milestone:** Play through one complete gist lesson, see attempt in Django admin

---

### Phase 4: Chunk Lessons (2-3 days) (Completed)

**Goal:** Chunking/repetition lessons work

#### Backend:

1. Create one chunk lesson JSON
2. Update lesson retrieval to handle chunk type

#### Mobile:

1. Implement RepeatStep component
2. Add audio recording capability
3. Add replay/retry UI
4. Basic self-assessment (confidence slider)

#### Claude Code prompts:

```
"Add RepeatStep component to React Native lesson runner: play audio chunk, record user speaking, allow retries, collect confidence rating"
```

**Testing milestone:** Complete a chunk lesson with audio recording

---

### Phase 5: Roleplay Lessons (2-3 days)

**Goal:** Roleplay lessons work

#### Backend:

1. Create one roleplay lesson JSON
2. Stub feedback endpoint (manual for now)

#### Mobile:

1. Implement RoleplayStep
2. Voice recording for free-form response
3. Display feedback/rewrite suggestions

#### Claude Code prompts:

```
"Add RoleplayStep component: play prompt audio, record user response, display task instructions, show feedback with suggested rewrites"
```

**Testing milestone:** Complete a roleplay lesson

---

### Phase 6: AI-Powered Situation Capture (4-5 days)

**Goal:** User describes situation → generates 3-lesson pack

#### Backend:

1. Create models: SituationLog, LessonPack
2. Build `/api/v1/situations/` endpoint
3. Build `/api/v1/situations/{id}/followups/` endpoint
4. **AI Integration:**
   - Create prompt templates for situation analysis
   - Use **Claude 3.5 Sonnet** (best at reasoning/structure) for:
     - Analyzing situation input
     - Generating follow-up questions
     - Extracting contexts and intents
   - Use **OpenAI GPT-4o** or **Claude** for:
     - Generating lesson content (steps JSON)
     - Creating phrasebook entries
   - Implement retry logic and error handling
5. Build lesson generation pipeline
6. Build `/api/v1/packs/{id}/` endpoint

#### Mobile:

1. SituationCaptureScreen with text input
2. Follow-up questions UI
3. "Generating pack" loading state
4. Display pack preview
5. "Start now" button

#### Claude Code prompts:

```
"Create Django endpoint for situation capture that uses Claude API to analyze user input, ask follow-up questions, and generate a 3-lesson pack with gist, chunk, and roleplay lessons"

"Build React Native situation capture screen: text input, display AI follow-up questions, show loading state while generating, display lesson pack preview"
```

#### AI Model Selection for MVP:

- **Situation analysis & lesson structure:** Claude 3.5 Sonnet (better reasoning)
- **Audio script generation:** GPT-4o (slightly better at natural dialogue)
- **Cost:** ~$0.50-2.00 per pack generation
- Store API keys in environment variables

**Testing milestone:** Submit situation → get pack → start first lesson

---

### Phase 7: Phrasebook Basics (2-3 days)

**Goal:** Save phrases, view list, basic drilling

#### Backend:

1. Create models: Phrase, UserPhrase
2. Seed 20-30 common phrases per language
3. Build `/api/v1/phrasebook/` endpoints

#### Mobile:

1. PhrasebookScreen with grouped list
2. Phrase detail with "Hear it" / "Say it"
3. Basic strength indicator

#### Claude Code prompts:

```
"Create Django Phrase and UserPhrase models with strength tracking. Add endpoints to list phrases filtered by context/intent and record drill attempts"

"Build React Native phrasebook screen: grouped list by context, phrase detail with audio playback and recording, strength indicator"
```

---

### Phase 8: Adaptive Coach v1 (3-4 days)

**Goal:** System generates weekly plan based on performance

#### Backend:

1. Create Plan model
2. Build coach rules engine (simple Python class)
3. Analyze attempt data (accuracy, replays, retries)
4. Generate next 7 sessions (40% review, 40% stabilize, 20% stretch)
5. Build `/api/v1/plan/recompute/` endpoint
6. Build `/api/v1/plan/week/` endpoint

#### Mobile:

1. Update HomeScreen with "Today's session"
2. Add "Next 7 sessions" preview list
3. Show focus contexts/intents

#### Claude Code prompts:

```
"Create Django adaptive coach that analyzes user lesson attempts and generates a weekly plan: 40% review (weakest areas), 40% similar difficulty, 20% stretch. Include focus contexts and intents"

"Update React Native home screen to display today's session card and next 7 sessions preview from backend plan"
```

**Testing milestone:** Complete several lessons → see plan adapt

---

### Phase 9: Progress Screen (2 days)

**Goal:** Show user their learning progress

#### Backend:

1. Build `/api/v1/progress/` endpoint with aggregated stats

#### Mobile:

1. ProgressScreen with charts/stats
2. Show comprehension trend
3. Show speaking attempts count
4. Show weak areas

#### Claude Code prompts:

```
"Add Django progress endpoint that aggregates user attempt data: comprehension accuracy over time, speaking attempts count, weakest contexts and intents"

"Build React Native progress screen with charts showing learning trends and weak areas"
```

---

### Phase 10: Content Pipeline & Polish (5-7 days)

**Goal:** Real content, audio, ready for testing

#### Content generation:

1. **Use AI to generate scenarios:**

   - Create script that uses Claude/GPT-4 to generate 25 scenarios per language
   - Cover all context categories (events, services, travel, food, health, social)
   - Generate scripts for each lesson type

2. **Audio generation:**

   - Use **ElevenLabs** (best quality, free tier: 10k chars/month)
   - Or **OpenAI TTS** (good quality, cheap: $15/million chars)
   - Generate audio files for all lessons
   - Store in Cloudflare R2 or Supabase Storage

3. **Seed database with lessons**

#### Polish:

1. Error handling throughout app
2. Loading states
3. Offline handling basics
4. Add Sentry for error tracking
5. Analytics events (basic Expo tracking)

#### Claude Code prompts:

```
"Create Python script to generate 25 language learning scenarios per language using Claude API, covering events, services, travel, food, health, social contexts. Generate lesson steps JSON for each"

"Add error boundaries, loading states, and retry logic throughout React Native app. Integrate Sentry for error tracking"
```

---

### Phase 11: Deployment (3-4 days)

**Goal:** Live MVP accessible to testers

#### Backend deployment (Render.com):

1. Create Render account
2. Connect GitHub repo
3. Set up PostgreSQL database
4. Configure environment variables
5. Deploy backend
6. Run migrations
7. Upload audio files to R2/Supabase

#### Mobile deployment:

1. Configure app.json for TestFlight/Play
2. Create developer accounts (Apple $99/year, Google $25 one-time)
3. Build with EAS Build
4. Submit to TestFlight
5. Submit to Google Play Internal Testing

#### Claude Code prompts:

```
"Configure Django for production deployment on Render: settings for PostgreSQL, static files, CORS, environment variables"

"Configure Expo app.json for iOS and Android builds with proper bundle identifiers, permissions, and app store metadata"
```

---

## Total Timeline

- **Part-time:** 8-10 weeks
- **Full-time:** 4-6 weeks

---

## Development Strategy with Claude Code

### How to use Claude Code effectively:

#### 1. Start each phase by reading the spec section

```
"Review the spec in the document and help me implement Phase X"
```

#### 2. Work in small, testable chunks

- Don't try to build an entire phase at once
- Test each piece as you go

#### 3. Example workflow for a feature:

```
You → "I need to build the SSO authentication endpoint. Create the Django view
       that verifies Apple ID tokens, creates users, and returns JWT tokens"

Claude Code → [generates code with comments]

You → Test it → Find issue → "The token verification is failing, here's the error..."

Claude Code → [debugs and fixes]
```

#### 4. Let Claude Code handle boilerplate

```
"Create the Django models for Scenario, Lesson, and Attempt based on the spec"

"Set up React Navigation with screens for Welcome, Onboarding, Home, Lesson Player"
```

#### 5. Ask for explanations

```
"Explain how this SSO flow works and what I need to configure"

"Why did you structure the lesson runner this way?"
```

#### 6. Request specific formats

```
"Add detailed comments explaining each change"

"Include error handling and logging"

"Add type hints to all Python functions"
```

---

## Key Success Tips for Solo Building

### 1. Test constantly

After each small feature, test it manually

### 2. Keep a dev journal

Document decisions, blockers, what worked

### 3. Version control hygiene

- Commit after each working feature
- Use descriptive commit messages
- Create branches for bigger features

### 4. Don't over-engineer

- Skip tests initially (add later)
- Hardcode things that work
- Polish later

### 5. Take breaks between phases

Let your brain consolidate

### 6. Deploy early

- Get backend live by Phase 5
- Start TestFlight by Phase 9
- Real environment catches issues

---

## Quick Reference: Tech Stack

### Mobile

- React Native + Expo
- TypeScript
- expo-apple-authentication
- expo-auth-session
- expo-av (audio)
- @react-navigation/native

### Backend

- Django 4.2+
- Django REST Framework
- djangorestframework-simplejwt
- python-jose (JWT verification)
- Django-Q (background tasks)

### AI Services

- Claude 3.5 Sonnet (Anthropic)
- GPT-4o (OpenAI)
- ElevenLabs or OpenAI TTS (audio)

### Infrastructure

- Render.com or Railway.app (hosting)
- PostgreSQL (database)
- Cloudflare R2 or Supabase (storage)
- Sentry (error tracking)

---

## Next Steps

1. ✅ Create GitHub repo with monorepo structure
2. ⬜ Set up backend (Phase 0)
3. ⬜ Set up mobile (Phase 0)
4. ⬜ Start Phase 1 (Authentication)
