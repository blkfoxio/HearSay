/**
 * Lessons list screen.
 *
 * Shows available lessons grouped by scenario.
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonsStackParamList, Lesson } from '../../types';
import colors from '../../styles/colors';

// Sample data for MVP
import { sampleLessonData } from './sampleLessonData';

type NavigationProp = NativeStackNavigationProp<LessonsStackParamList>;

export default function LessonsListScreen() {
  const navigation = useNavigation<NavigationProp>();

  // Group lessons by scenario
  const groupedLessons = sampleLessonData.reduce((acc, lesson) => {
    const key = lesson.scenarioTitle;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const handleLessonPress = (lessonId: number) => {
    navigation.navigate('LessonPlayer', { lessonId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Your Lessons</Text>
          <Text style={styles.subtitle}>
            Practice listening comprehension with real conversations
          </Text>

          {Object.entries(groupedLessons).map(([scenarioTitle, lessons]) => (
            <View key={scenarioTitle} style={styles.scenarioSection}>
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioTitle}>{scenarioTitle}</Text>
                <Text style={styles.lessonCount}>
                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                </Text>
              </View>

              <View style={styles.lessonsContainer}>
                {lessons.map((lesson) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={styles.lessonCard}
                    onPress={() => handleLessonPress(lesson.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.lessonIcon}>
                      <Text style={styles.lessonIconText}>
                        {lesson.lessonType === 'chunk' ? '🎤' : lesson.lessonType === 'roleplay' ? '💬' : '🎧'}
                      </Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonDescription} numberOfLines={2}>
                        {lesson.description}
                      </Text>
                      <View style={styles.lessonMeta}>
                        <Text style={[
                          styles.lessonTypeTag,
                          lesson.lessonType === 'chunk' && styles.lessonTypeTagChunk,
                          lesson.lessonType === 'roleplay' && styles.lessonTypeTagRoleplay
                        ]}>
                          {lesson.lessonType === 'chunk' ? 'Practice' : lesson.lessonType === 'roleplay' ? 'Roleplay' : 'Listening'}
                        </Text>
                        <Text style={styles.lessonMetaText}>
                          ⏱️ {lesson.estimatedMinutes} min
                        </Text>
                        <Text style={styles.lessonMetaText}>
                          {lesson.steps.length} steps
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  scenarioSection: {
    marginBottom: 24,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  lessonCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  lessonsContainer: {
    gap: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonIconText: {
    fontSize: 24,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonMetaText: {
    fontSize: 12,
    color: colors.gray500,
  },
  lessonTypeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  lessonTypeTagChunk: {
    color: colors.success,
    backgroundColor: colors.success + '20',
  },
  lessonTypeTagRoleplay: {
    color: colors.warning,
    backgroundColor: colors.warning + '20',
  },
  chevron: {
    fontSize: 24,
    color: colors.gray400,
    marginLeft: 8,
  },
});
