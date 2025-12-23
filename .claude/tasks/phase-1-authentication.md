# Phase 1: Authentication - COMPLETED

**Status**: ✅ Complete
**Started**: 2025-12-15
**Completed**: 2025-12-15

## Goal

Implement Sign in with Apple + Google SSO working end-to-end.

## Overview

SSO authentication handles both sign-in AND sign-up in a single flow:
1. User taps Apple/Google button
2. SSO provider authenticates and returns ID token
3. App sends token to backend `/api/v1/auth/sso/`
4. Backend verifies token, creates user if new OR signs in if existing
5. Backend returns JWT tokens (access + refresh)
6. App stores tokens and navigates based on `onboardingCompleted` flag

## Completed Tasks

### Backend

- [x] Create `users/urls.py` with auth routes
- [x] Create `/api/v1/auth/sso/` endpoint
- [x] Add Apple ID token verification (using `python-jose`)
- [x] Add Google ID token verification
- [x] Return JWT tokens on successful auth
- [x] Create `/api/v1/me/` endpoint to get current user
- [x] Create `/api/v1/me/update/` endpoint to update user
- [x] Create `/api/v1/auth/logout/` endpoint

### Mobile

- [x] Implement Apple Sign-In with `expo-apple-authentication`
- [x] Implement Google Sign-In with `expo-auth-session`
- [x] Update `AuthContext` to handle SSO flow
- [x] Store tokens in SecureStore after successful auth
- [x] Add token refresh logic on app startup
- [x] Handle auth errors gracefully
- [x] Create auth API module (`src/api/auth.ts`)

## API Endpoints

### POST /api/v1/auth/sso/

**Request:**
```json
{
  "provider": "apple" | "google",
  "id_token": "eyJ...",
  "email": "user@example.com",        // Optional, from Apple
  "first_name": "John",               // Optional, from Apple
  "last_name": "Doe"                  // Optional, from Apple
}
```

**Response (success):**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user_abc123",
    "first_name": "John",
    "last_name": "Doe",
    "sso_provider": "apple",
    "onboarding_completed": false,
    "profile": null
  }
}
```

### GET /api/v1/me/

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "user_abc123",
  "first_name": "John",
  "last_name": "Doe",
  "sso_provider": "apple",
  "onboarding_completed": false,
  "profile": null
}
```

### PATCH /api/v1/me/update/

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe"
}
```

### POST /api/v1/auth/logout/

**Request:**
```json
{
  "refresh": "eyJ..."
}
```

## Files Created/Modified

### Backend
- `backend/users/urls.py` (new) - Auth URL routes
- `backend/users/views.py` (new) - Auth views and endpoints
- `backend/users/services.py` (new) - Token verification logic
- `backend/config/urls.py` (updated) - Include users.urls

### Mobile
- `mobile/src/api/auth.ts` (new) - Auth API functions
- `mobile/src/api/client.ts` (updated) - Added setAccessToken
- `mobile/src/screens/auth/WelcomeScreen.tsx` (updated) - SSO implementation
- `mobile/src/contexts/AuthContext.tsx` (updated) - Full SSO flow

## Token Verification Implementation

### Apple ID Token
- Fetches Apple's public keys from `https://appleid.apple.com/auth/keys`
- Verifies JWT signature using RS256
- Checks `iss` = `https://appleid.apple.com`
- Checks `aud` = app's bundle identifier
- Checks `exp` is not expired
- Extracts `sub` (unique user ID) and `email`

### Google ID Token
- Verifies using Google's tokeninfo endpoint
- Checks `aud` = Google Client ID
- Checks `exp` is not expired
- Extracts `sub` (unique user ID), `email`, `given_name`, `family_name`

## Development Mode

For testing without real SSO providers, the backend supports a dev mode:
- Send `dev_mode: true` in the request body
- Works only when `DEBUG=True`
- Generates mock user info for testing

## Configuration Required

### Google OAuth Setup
To enable Google Sign-In, you need to:
1. Create a project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials (Web, iOS, Android)
4. Add client IDs to environment variables:
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

### Apple Sign-In Setup
To enable Apple Sign-In, you need to:
1. Enable Sign in with Apple capability in Apple Developer Portal
2. Configure the bundle identifier in `app.json`
3. Add the Apple Sign-In entitlement

## Testing

### Backend Testing
```bash
cd backend
source venv/bin/activate

# Test SSO endpoint (dev mode)
curl -X POST http://localhost:8000/api/v1/auth/sso/ \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "apple",
    "id_token": "test_token",
    "dev_mode": true,
    "email": "test@example.com"
  }'
```

### Mobile Testing
```bash
cd mobile
npx expo start --tunnel
```

## Notes

- Apple only provides user's name on FIRST sign-in, must store it
- Google always provides user info
- Development mode allows testing without real SSO setup
- Handle case where user revokes app access and signs in again

## Next Steps (Phase 2: Onboarding)

1. Implement language selection screen
2. Create proficiency assessment quiz
3. Build personas/goals selection
4. Implement schedule preferences
5. Complete UserProfile creation on onboarding completion
