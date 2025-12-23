/**
 * API client for HearSay backend.
 *
 * Handles authentication, token refresh, and API requests.
 */

import * as SecureStore from "expo-secure-store";
import { AuthTokens, ApiError } from "../types";

// API Configuration
// Use ngrok URL for development when on restricted networks (WeWork, etc.)
// Update this URL whenever you restart ngrok
const NGROK_URL = "https://958277f026f9.ngrok-free.app";

const API_BASE_URL = __DEV__
  ? `${NGROK_URL}/api/v1`
  : "https://api.hearsay.app/api/v1"; // Update for production

// Media URL for audio/image files
export const MEDIA_BASE_URL = __DEV__ ? NGROK_URL : "https://api.hearsay.app"; // Update for production

const TOKEN_KEY = "auth_tokens";

// In-memory access token for immediate use after sign-in
let currentAccessToken: string | null = null;

/**
 * Set access token for immediate use (before async storage completes).
 */
export function setAccessToken(token: string | null): void {
  currentAccessToken = token;
}

/**
 * Store authentication tokens securely.
 */
export async function storeTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
}

/**
 * Retrieve stored authentication tokens.
 */
export async function getTokens(): Promise<AuthTokens | null> {
  const tokensJson = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!tokensJson) return null;

  try {
    return JSON.parse(tokensJson) as AuthTokens;
  } catch {
    return null;
  }
}

/**
 * Clear stored authentication tokens.
 */
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Check if user is authenticated (has valid tokens).
 */
export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getTokens();
  return tokens !== null;
}

/**
 * Refresh access token using refresh token.
 */
async function refreshAccessToken(): Promise<AuthTokens | null> {
  const tokens = await getTokens();
  if (!tokens?.refresh) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (!response.ok) {
      // Refresh token expired - clear tokens
      await clearTokens();
      return null;
    }

    const newTokens: AuthTokens = await response.json();
    await storeTokens(newTokens);
    return newTokens;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

/**
 * Make an authenticated API request.
 *
 * Automatically includes auth header and handles token refresh.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let tokens = await getTokens();

  // Use in-memory token if available, otherwise use stored token
  const activeToken = currentAccessToken || tokens?.access || null;

  // Build request
  const makeRequest = async (accessToken: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true", // Skip ngrok free tier interstitial
    };

    // Merge any additional headers from options
    if (options.headers) {
      const optHeaders = options.headers as Record<string, string>;
      Object.assign(headers, optHeaders);
    }

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return response;
  };

  // Try request with current token
  let response = await makeRequest(activeToken);

  // If unauthorized and we have a refresh token, try refreshing
  if (response.status === 401 && tokens?.refresh) {
    const newTokens = await refreshAccessToken();
    if (newTokens) {
      response = await makeRequest(newTokens.access);
    }
  }

  // Parse response
  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error.detail || "An error occurred");
  }

  return data as T;
}

/**
 * Health check endpoint.
 */
export async function healthCheck(): Promise<{
  status: string;
  version: string;
}> {
  const response = await fetch(`${API_BASE_URL}/health/`);
  return response.json();
}

/**
 * API root endpoint.
 */
export async function getApiInfo(): Promise<{
  name: string;
  version: string;
  endpoints: Record<string, string>;
}> {
  const response = await fetch(`${API_BASE_URL}/`);
  return response.json();
}
