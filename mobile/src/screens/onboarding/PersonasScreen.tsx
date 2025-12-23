/**
 * Goals/Personas selection screen.
 *
 * Users select 1-3 learning goals that personalize their experience.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { useOnboarding, LearningGoal } from '../../contexts/OnboardingContext';
import { colors } from '../../styles/colors';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Personas'>;
};

interface GoalOption {
  id: LearningGoal;
  emoji: string;
  title: string;
  description: string;
}

const goalOptions: GoalOption[] = [
  {
    id: 'travel',
    emoji: '✈️',
    title: 'Travel',
    description: 'Navigate airports, hotels, restaurants & transportation',
  },
  {
    id: 'work',
    emoji: '💼',
    title: 'Work & Business',
    description: 'Professional conversations, meetings & networking',
  },
  {
    id: 'education',
    emoji: '🎓',
    title: 'Education',
    description: 'Academic settings, studying abroad, exams',
  },
  {
    id: 'conversation',
    emoji: '💬',
    title: 'Daily Conversation',
    description: 'Casual chats with friends, neighbors & locals',
  },
  {
    id: 'culture',
    emoji: '🎭',
    title: 'Culture & Entertainment',
    description: 'Movies, music, books & cultural experiences',
  },
  {
    id: 'family',
    emoji: '👨‍👩‍👧‍👦',
    title: 'Family & Relationships',
    description: 'Connect with family members or a partner',
  },
];

export default function PersonasScreen({ navigation }: Props) {
  const { goals, toggleGoal } = useOnboarding();

  const handleContinue = () => {
    navigation.navigate('Schedule');
  };

  const canContinue = goals.length >= 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>What are your goals?</Text>
          <Text style={styles.subtitle}>
            Select up to 3 goals. We'll personalize your lessons accordingly.
          </Text>
        </View>

        <ScrollView
          style={styles.goalsContainer}
          contentContainerStyle={styles.goalsContent}
          showsVerticalScrollIndicator={false}
        >
          {goalOptions.map((goal) => {
            const isSelected = goals.includes(goal.id);
            const isDisabled = !isSelected && goals.length >= 3;

            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                  isDisabled && styles.goalCardDisabled,
                ]}
                onPress={() => toggleGoal(goal.id)}
                disabled={isDisabled}
                activeOpacity={0.7}
              >
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <View style={styles.goalTextContainer}>
                  <Text
                    style={[
                      styles.goalTitle,
                      isSelected && styles.goalTitleSelected,
                    ]}
                  >
                    {goal.title}
                  </Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.selectionCount}>
            {goals.length} of 3 selected
          </Text>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !canContinue && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  goalsContainer: {
    flex: 1,
  },
  goalsContent: {
    paddingBottom: 16,
    gap: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  goalCardDisabled: {
    opacity: 0.5,
  },
  goalEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  goalTitleSelected: {
    color: colors.primaryDark,
  },
  goalDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 20,
  },
  selectionCount: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
