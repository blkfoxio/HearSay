/**
 * Lessons stack navigator.
 *
 * Handles navigation for lessons list, player, and completion screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../types';

// Screens
import LessonsListScreen from '../screens/lessons/LessonsListScreen';
import LessonPlayerScreen from '../screens/lessons/LessonPlayerScreen';
import LessonCompleteScreen from '../screens/lessons/LessonCompleteScreen';

const Stack = createNativeStackNavigator<LessonsStackParamList>();

export default function LessonsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LessonList" component={LessonsListScreen} />
      <Stack.Screen
        name="LessonPlayer"
        component={LessonPlayerScreen}
        options={{
          gestureEnabled: false, // Prevent accidental swipe back during lesson
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="LessonComplete"
        component={LessonCompleteScreen}
        options={{
          gestureEnabled: false,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
}
