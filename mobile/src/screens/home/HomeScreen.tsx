/**
 * Home screen showing today's lesson and progress.
 *
 * Displays the next lesson to complete and user stats.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types';
import colors from '../../styles/colors';

// Sample data for MVP
import { sampleLessonData } from '../lessons/sampleLessonData';

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Get the first lesson as "today's lesson" for MVP
  const todaysLesson = sampleLessonData[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStartLesson = () => {
    // Navigate to Lessons tab with nested screen
    navigation.navigate('Lessons', {
      screen: 'LessonPlayer',
      params: { lessonId: todaysLesson.id },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Greeting */}
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>{getGreeting()}! 👋</Text>
            <Text style={styles.subtitle}>Ready for today's lesson?</Text>
          </View>

          {/* Today's Lesson Card */}
          <TouchableOpacity
            style={styles.todayCard}
            onPress={handleStartLesson}
            activeOpacity={0.9}
          >
            <Text style={styles.cardLabel}>TODAY'S SESSION</Text>
            <Text style={styles.cardTitle}>{todaysLesson.title}</Text>
            <Text style={styles.cardScenario}>{todaysLesson.scenarioTitle}</Text>
            <Text style={styles.cardDescription}>{todaysLesson.description}</Text>

            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⏱️</Text>
                <Text style={styles.metaText}>{todaysLesson.estimatedMinutes} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📝</Text>
                <Text style={styles.metaText}>{todaysLesson.steps.length} steps</Text>
              </View>
            </View>

            <View style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Lesson</Text>
            </View>
          </TouchableOpacity>

          {/* Stats */}
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📚</Text>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⏰</Text>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>

          {/* More Lessons Section */}
          <View style={styles.moreLessonsSection}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <View style={styles.lessonsList}>
              {sampleLessonData.slice(1, 3).map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonItem}
                  onPress={() => {
                    navigation.navigate('Lessons', {
                      screen: 'LessonPlayer',
                      params: { lessonId: lesson.id },
                    } as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.lessonIcon}>
                    <Text style={styles.lessonIconText}>🎧</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonScenario}>{lesson.scenarioTitle}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  greeting: {
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  todayCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  cardScenario: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  startButton: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  moreLessonsSection: {
    marginTop: 8,
  },
  lessonsList: {
    gap: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
  },
  lessonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonIconText: {
    fontSize: 20,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  lessonScenario: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: colors.gray400,
    marginLeft: 8,
  },
});
