/**
 * Onboarding flow navigation.
 *
 * Screens: Language -> Quiz -> Personas -> Schedule
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../types';

// Placeholder screens (will be implemented in Phase 2)
import LanguageScreen from '../screens/onboarding/LanguageScreen';
import QuizScreen from '../screens/onboarding/QuizScreen';
import PersonasScreen from '../screens/onboarding/PersonasScreen';
import ScheduleScreen from '../screens/onboarding/ScheduleScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ title: 'Choose Language' }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ title: 'Quick Assessment' }}
      />
      <Stack.Screen
        name="Personas"
        component={PersonasScreen}
        options={{ title: 'Your Goals' }}
      />
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: 'Your Schedule' }}
      />
    </Stack.Navigator>
  );
}
