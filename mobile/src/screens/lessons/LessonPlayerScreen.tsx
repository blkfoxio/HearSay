/**
 * Lesson player screen.
 *
 * Loads lesson data and renders the LessonRunner component.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Lesson, LessonsStackParamList, StepResponse } from '../../types';
import { getLesson } from '../../api/lessons';
import { LessonRunner } from '../../components/lesson';
import colors from '../../styles/colors';

// Hardcoded lesson data for MVP (until API is ready)
import { sampleLessonData } from './sampleLessonData';

type LessonPlayerRouteProp = RouteProp<LessonsStackParamList, 'LessonPlayer'>;
type NavigationProp = NativeStackNavigationProp<LessonsStackParamList>;

export default function LessonPlayerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LessonPlayerRouteProp>();
  const { lessonId } = route.params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    setLoading(true);
    setError(null);

    try {
      // For MVP, use hardcoded data
      // In production: const data = await getLesson(lessonId);
      const data = sampleLessonData.find(l => l.id === lessonId);

      if (!data) {
        throw new Error('Lesson not found');
      }

      setLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = (responses: StepResponse[], score: number) => {
    // In production, submit attempt to API
    // await submitLessonAttempt(lessonId, attemptId, { responses, score, durationSeconds });

    navigation.replace('LessonComplete', { lessonId, score });
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Lesson',
      'Are you sure you want to exit? Your progress will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error || 'Lesson not found'}</Text>
      </View>
    );
  }

  return (
    <LessonRunner
      lesson={lesson}
      onComplete={handleLessonComplete}
      onExit={handleExit}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
