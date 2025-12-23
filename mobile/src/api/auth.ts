/**
 * Authentication API functions.
 *
 * Handles SSO authentication with Apple and Google.
 */

import { apiRequest } from './client';
import { User, AuthTokens, SSOCredentials } from '../types';

/**
 * Response from SSO authentication endpoint.
 */
export interface SSOAuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Authenticate via SSO provider (Apple or Google).
 *
 * This handles BOTH sign-in and sign-up:
 * - If user exists: signs them in
 * - If user is new: creates account and signs them in
 *
 * @param credentials - SSO credentials from the provider
 * @returns Auth response with tokens and user data
 */
export async function authenticateWithSSO(
  credentials: SSOCredentials
): Promise<SSOAuthResponse> {
  return apiRequest<SSOAuthResponse>('/auth/sso/', {
    method: 'POST',
    body: JSON.stringify({
      provider: credentials.provider,
      id_token: credentials.idToken,
      email: credentials.email,
      first_name: credentials.firstName,
      last_name: credentials.lastName,
    }),
  });
}

/**
 * Get current authenticated user.
 *
 * @returns Current user data
 */
export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/me/');
}

/**
 * Update current user profile.
 *
 * @param updates - Fields to update
 * @returns Updated user data
 */
export async function updateCurrentUser(
  updates: Partial<Pick<User, 'firstName' | 'lastName'>>
): Promise<User> {
  return apiRequest<User>('/me/update/', {
    method: 'PATCH',
    body: JSON.stringify({
      first_name: updates.firstName,
      last_name: updates.lastName,
    }),
  });
}

/**
 * Log out current user.
 *
 * @param refreshToken - The refresh token to blacklist
 */
export async function logout(refreshToken: string): Promise<void> {
  await apiRequest('/auth/logout/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  });
}
