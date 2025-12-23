/**
 * Authentication context for managing user auth state.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  getTokens,
  storeTokens,
  clearTokens,
  setAccessToken,
} from '../api/client';
import { getCurrentUser, logout as logoutApi } from '../api/auth';
import { User, AuthTokens } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch current user from API.
   */
  const fetchUser = useCallback(async () => {
    try {
      const tokens = await getTokens();
      if (!tokens) {
        setUser(null);
        return;
      }

      // Set access token for API requests
      setAccessToken(tokens.access);

      // Fetch user from /api/v1/me/ endpoint
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Token might be invalid, clear it
      await clearTokens();
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  /**
   * Initialize auth state on app load.
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await fetchUser();
      setIsLoading(false);
    };

    initAuth();
  }, [fetchUser]);

  /**
   * Sign in with tokens (after SSO authentication).
   */
  const signIn = useCallback(async (tokens: AuthTokens) => {
    // Store tokens securely
    await storeTokens(tokens);
    // Set access token for immediate use
    setAccessToken(tokens.access);
    // Fetch user data
    await fetchUser();
  }, [fetchUser]);

  /**
   * Sign out user.
   */
  const signOut = useCallback(async () => {
    try {
      const tokens = await getTokens();
      if (tokens?.refresh) {
        // Blacklist the refresh token on the server
        await logoutApi(tokens.refresh);
      }
    } catch (error) {
      // Ignore logout errors - we'll clear local state anyway
      console.error('Logout API error:', error);
    }

    // Clear local tokens and state
    await clearTokens();
    setAccessToken(null);
    setUser(null);
  }, []);

  /**
   * Refresh user data.
   */
  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
