# HearSay

An AI-powered mobile language learning application that helps users develop real-world conversation skills through personalized, context-driven lessons.

## Features

- **Adaptive Learning**: AI coach adjusts lesson difficulty based on your performance
- **Situation-Based Learning**: Capture real-life situations and get custom lesson packs
- **Three Lesson Types**:
  - Meaning-first listening (gist comprehension)
  - Chunked speech training (pronunciation and fluency)
  - Interactive roleplay (real conversation practice)
- **Personal Phrasebook**: Save and drill phrases relevant to your life
- **SSO Authentication**: Sign in with Apple or Google

## Tech Stack

- **Mobile**: React Native + Expo + TypeScript
- **Backend**: Django + Django REST Framework
- **Database**: PostgreSQL (SQLite for development)
- **AI**: OpenAI for TTS audio generation, Claude/OpenAI for lesson generation
- **Auth**: Apple Sign-In, Google Sign-In with JWT

## Project Structure

```
hearsay/
├── backend/          # Django REST API
├── mobile/           # React Native + Expo app
├── scripts/          # Utility scripts (TTS generation, etc.)
├── documentation/    # Project specs and planning docs
└── .claude/          # Development task tracking
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or physical device with Expo Go

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your environment file:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` and configure:
   - `SECRET_KEY`: Generate a secure key for production
   - `ALLOWED_HOSTS`: Add your local IP and/or ngrok domain
   - `OPENAI_API_KEY`: Required for TTS audio generation

6. Run migrations:
   ```bash
   python manage.py migrate
   ```

7. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

8. Start the development server:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

### Mobile Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API URL in `src/api/client.ts`:
   - For local network testing: Use your computer's local IP
   - For restricted networks (WeWork, etc.): Use ngrok URL

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

5. Run on your device:
   - **iOS Simulator**: Press `i`
   - **Android Emulator**: Press `a`
   - **Physical Device**: Scan QR code with Expo Go app

### Network Configuration (for mobile device testing)

If your mobile device and computer are on different networks (e.g., corporate WiFi):

1. Install ngrok: `brew install ngrok` or download from ngrok.com
2. Start ngrok tunnel: `ngrok http 8000`
3. Update `ALLOWED_HOSTS` in `backend/.env` to include `.ngrok-free.app,.ngrok.io`
4. Update `NGROK_URL` in `mobile/src/api/client.ts` with your ngrok URL
5. Restart the backend server

### Audio Generation

To generate TTS audio files for lessons:

```bash
# Activate backend venv first
source backend/venv/bin/activate

# Generate chunk lesson audio
python scripts/generate_chunk_audio.py

# Generate roleplay lesson audio
python scripts/generate_roleplay_audio.py
```

Requires `OPENAI_API_KEY` in your backend/.env file.

## Development Status

### Completed Phases
- [x] Phase 0: Project Setup
- [x] Phase 1: Authentication (Apple/Google SSO)
- [x] Phase 2: Onboarding Flow
- [x] Phase 3: Gist Lessons (listening comprehension)
- [x] Phase 4: Chunk Lessons (pronunciation practice)
- [x] Phase 5: Roleplay Lessons (conversation practice)

### Upcoming Phases
- [ ] Phase 6: AI-Powered Situation Capture
- [ ] Phase 7: Phrasebook
- [ ] Phase 8: Adaptive Coach
- [ ] Phase 9: Progress Tracking
- [ ] Phase 10: Content Pipeline & Polish
- [ ] Phase 11: Deployment

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DEBUG` | Enable debug mode | Yes |
| `SECRET_KEY` | Django secret key | Yes |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | Yes |
| `DATABASE_URL` | Database connection string | Yes |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | Yes |
| `OPENAI_API_KEY` | OpenAI API key for TTS | For audio generation |
| `APPLE_CLIENT_ID` | Apple Sign-In client ID | For Apple auth |
| `GOOGLE_CLIENT_ID` | Google Sign-In client ID | For Google auth |

## License

Apache 2.0 - See LICENSE file for details
