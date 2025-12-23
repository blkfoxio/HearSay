/**
 * Lesson completion screen.
 *
 * Shows results and encourages the user after completing a lesson.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../types';
import colors from '../../styles/colors';

type LessonCompleteRouteProp = RouteProp<LessonsStackParamList, 'LessonComplete'>;
type NavigationProp = NativeStackNavigationProp<LessonsStackParamList>;

export default function LessonCompleteScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LessonCompleteRouteProp>();
  const { score } = route.params;

  const percentage = Math.round(score * 100);

  const getResultMessage = () => {
    if (percentage >= 90) return { emoji: '🌟', title: 'Outstanding!', message: 'You\'re mastering this!' };
    if (percentage >= 70) return { emoji: '🎉', title: 'Great job!', message: 'Keep up the good work!' };
    if (percentage >= 50) return { emoji: '💪', title: 'Good effort!', message: 'Practice makes perfect!' };
    return { emoji: '📚', title: 'Keep learning!', message: 'Every step counts!' };
  };

  const result = getResultMessage();

  const handleContinue = () => {
    // Reset the lessons stack and go back to tabs with Lessons tab visible
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'LessonList' }],
      })
    );
  };

  const handleRetry = () => {
    // Go back and start the lesson again
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Result Display */}
        <View style={styles.resultContainer}>
          <Text style={styles.emoji}>{result.emoji}</Text>
          <Text style={styles.title}>{result.title}</Text>
          <Text style={styles.message}>{result.message}</Text>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{percentage}%</Text>
          </View>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, { width: `${percentage}%` }]} />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+5</Text>
            <Text style={styles.statLabel}>Minutes practiced</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+1</Text>
            <Text style={styles.statLabel}>Lesson completed</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          {percentage < 90 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetry}
            >
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  scoreCard: {
    backgroundColor: colors.gray50,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray50,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray200,
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.gray100,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
