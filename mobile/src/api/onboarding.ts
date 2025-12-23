/**
 * Onboarding API functions.
 *
 * Handles onboarding data submission and profile creation.
 */

import { apiRequest } from './client';
import { User, UserProfile } from '../types';
import { OnboardingSubmitData } from '../contexts/OnboardingContext';

/**
 * Response from onboarding completion endpoint.
 */
export interface OnboardingCompleteResponse {
  user: User;
  profile: UserProfile;
}

/**
 * Complete onboarding and create user profile.
 *
 * Submits all onboarding data to the backend which:
 * 1. Creates a UserProfile with learning preferences
 * 2. Sets user.onboarding_completed = true
 * 3. Returns updated user and profile
 *
 * @param data - Onboarding data collected from all screens
 * @returns Response with updated user and new profile
 */
export async function completeOnboarding(
  data: OnboardingSubmitData
): Promise<OnboardingCompleteResponse> {
  return apiRequest<OnboardingCompleteResponse>('/onboarding/complete/', {
    method: 'POST',
    body: JSON.stringify({
      target_language: data.target_language,
      quiz_score: data.quiz_score,
      goals: data.goals,
      sessions_per_week: data.sessions_per_week,
      reminder_time: data.reminder_time,
      notifications_enabled: data.notifications_enabled,
    }),
  });
}
