/**
 * Welcome screen with SSO sign-in options.
 *
 * This screen handles BOTH sign-in and sign-up through SSO providers.
 * The backend determines if a user is new (creates account) or existing (signs in).
 *
 * SSO Flow:
 * 1. User taps Apple/Google button
 * 2. SSO provider authenticates and returns ID token
 * 3. App sends token to backend /api/v1/auth/sso/
 * 4. Backend creates new user OR signs in existing user
 * 5. Backend returns JWT tokens
 * 6. App stores tokens and navigates to Onboarding (new) or Home (returning)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../contexts/AuthContext';
import { authenticateWithSSO } from '../../api/auth';
import { SSOCredentials } from '../../types';

// Required for Google auth to work properly on web
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs - these will need to be configured in app.json
// and Google Cloud Console
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export default function WelcomeScreen() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'apple' | 'google' | null>(null);

  // Google Auth setup - Expo handles redirect URI automatically
  const [, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  // Handle Google response when it changes
  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      handleSSOAuth({
        provider: 'google',
        idToken: id_token,
      });
    } else if (googleResponse?.type === 'error') {
      Alert.alert('Sign In Failed', 'Google sign in was cancelled or failed.');
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }, [googleResponse]);

  /**
   * Handle SSO authentication with backend.
   */
  const handleSSOAuth = async (credentials: SSOCredentials) => {
    try {
      const response = await authenticateWithSSO(credentials);

      // Store tokens and user via AuthContext
      await signIn({
        access: response.access,
        refresh: response.refresh,
      });

      // Navigation is handled automatically by RootNavigator
      // based on isAuthenticated and onboardingCompleted
    } catch (error: any) {
      console.error('SSO authentication error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Unable to sign in. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  /**
   * Handle Apple Sign In.
   * Apple SSO handles both sign-in and sign-up automatically.
   */
  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoadingProvider('apple');

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Apple only provides name on first sign-in, so we pass it along
      await handleSSOAuth({
        provider: 'apple',
        idToken: credential.identityToken!,
        email: credential.email || undefined,
        firstName: credential.fullName?.givenName || undefined,
        lastName: credential.fullName?.familyName || undefined,
      });
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled, don't show error
        console.log('Apple Sign In cancelled');
      } else {
        console.error('Apple Sign In error:', error);
        Alert.alert(
          'Sign In Failed',
          'Apple sign in failed. Please try again.'
        );
      }
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  /**
   * Handle Google Sign In.
   * Google SSO handles both sign-in and sign-up automatically.
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoadingProvider('google');
      await googlePromptAsync();
      // Response is handled in the useEffect above
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      Alert.alert(
        'Sign In Failed',
        'Google sign in failed. Please try again.'
      );
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and branding */}
        <View style={styles.brandingContainer}>
          <Text style={styles.logoText}>HearSay</Text>
          <Text style={styles.tagline}>
            Learn languages through real conversations
          </Text>
        </View>

        {/* Features list */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            emoji="🎧"
            title="Listen & Understand"
            description="Master real-world conversations"
          />
          <FeatureItem
            emoji="🗣️"
            title="Speak & Practice"
            description="Build confidence through roleplay"
          />
          <FeatureItem
            emoji="🎯"
            title="Personalized Learning"
            description="AI adapts to your goals"
          />
        </View>

        {/* Sign in/up buttons - SSO handles both flows */}
        <View style={styles.authContainer}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.button, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              {loadingProvider === 'apple' ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.appleButtonText}>
                   Continue with Apple
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            {loadingProvider === 'google' ? (
              <ActivityIndicator color="#374151" />
            ) : (
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  emoji: string;
  title: string;
  description: string;
}

function FeatureItem({ emoji, title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  authContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
