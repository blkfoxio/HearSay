/**
 * Schedule preference screen.
 *
 * Final step of onboarding - set sessions per week and reminder time.
 * Submits onboarding data to backend and creates UserProfile.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { completeOnboarding } from '../../api/onboarding';
import { colors } from '../../styles/colors';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Schedule'>;
};

const sessionOptions = [1, 2, 3, 4, 5, 6, 7];

const timeOptions = [
  { label: 'Morning (8 AM)', value: '08:00' },
  { label: 'Mid-morning (10 AM)', value: '10:00' },
  { label: 'Noon (12 PM)', value: '12:00' },
  { label: 'Afternoon (3 PM)', value: '15:00' },
  { label: 'Evening (6 PM)', value: '18:00' },
  { label: 'Night (9 PM)', value: '21:00' },
];

export default function ScheduleScreen(_props: Props) {
  const {
    sessionsPerWeek,
    setSessionsPerWeek,
    reminderTime,
    setReminderTime,
    notificationsEnabled,
    setNotificationsEnabled,
    getOnboardingData,
  } = useOnboarding();
  const { refreshUser } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  const selectedTimeLabel =
    timeOptions.find((t) => t.value === reminderTime)?.label || 'Select time';

  const handleComplete = async () => {
    if (isSubmitting) return; // Prevent double-tap

    try {
      setIsSubmitting(true);
      const data = getOnboardingData();
      await completeOnboarding(data);
      await refreshUser();
      // Navigation handled by RootNavigator based on onboardingCompleted
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      // If already completed, just refresh user to trigger navigation
      if (error.message?.includes('already completed')) {
        await refreshUser();
        return;
      }
      Alert.alert(
        'Error',
        error.message || 'Failed to complete onboarding. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Set your pace</Text>
          <Text style={styles.subtitle}>
            How often do you want to practice? You can change this anytime.
          </Text>
        </View>

        {/* Sessions per week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessions per week</Text>
          <View style={styles.sessionsContainer}>
            {sessionOptions.map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.sessionButton,
                  sessionsPerWeek === num && styles.sessionButtonSelected,
                ]}
                onPress={() => setSessionsPerWeek(num)}
              >
                <Text
                  style={[
                    styles.sessionButtonText,
                    sessionsPerWeek === num && styles.sessionButtonTextSelected,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sessionHint}>
            {sessionsPerWeek <= 2
              ? 'Great for beginners! Consistency is key.'
              : sessionsPerWeek <= 4
              ? 'Balanced approach for steady progress.'
              : 'Intensive schedule for fast results!'}
          </Text>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.notificationRow}>
            <View>
              <Text style={styles.sectionTitle}>Reminders</Text>
              <Text style={styles.notificationSubtitle}>
                Get notified when it's time to practice
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.gray300, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.gray100}
            />
          </View>

          {notificationsEnabled && (
            <View style={styles.timeSelector}>
              <Text style={styles.timeSelectorLabel}>Remind me at:</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimeOptions(!showTimeOptions)}
              >
                <Text style={styles.timeButtonText}>{selectedTimeLabel}</Text>
                <Text style={styles.timeButtonArrow}>
                  {showTimeOptions ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showTimeOptions && (
                <View style={styles.timeOptionsContainer}>
                  {timeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.timeOption,
                        reminderTime === option.value &&
                          styles.timeOptionSelected,
                      ]}
                      onPress={() => {
                        setReminderTime(option.value);
                        setShowTimeOptions(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          reminderTime === option.value &&
                            styles.timeOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.startButton, isSubmitting && styles.startButtonDisabled]}
            onPress={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.startButtonText}>Start Learning!</Text>
            )}
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
    marginBottom: 32,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sessionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 48,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sessionButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: colors.primary,
  },
  sessionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sessionButtonTextSelected: {
    color: colors.primary,
  },
  sessionHint: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  timeSelector: {
    marginTop: 20,
  },
  timeSelectorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  timeButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  timeButtonArrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeOptionsContainer: {
    marginTop: 8,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  timeOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  timeOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  timeOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  timeOptionTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  startButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
