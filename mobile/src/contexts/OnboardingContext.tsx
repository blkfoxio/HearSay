/**
 * Onboarding context for managing onboarding flow state.
 *
 * Stores user selections across onboarding screens:
 * Language → Quiz → Goals → Schedule
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { TargetLanguage } from '../types';

export type LearningGoal =
  | 'travel'
  | 'work'
  | 'education'
  | 'conversation'
  | 'culture'
  | 'family';

interface OnboardingState {
  targetLanguage: TargetLanguage | null;
  quizAnswers: number[];
  quizScore: number;
  goals: LearningGoal[];
  sessionsPerWeek: number;
  reminderTime: string | null;
  notificationsEnabled: boolean;
}

interface OnboardingContextType extends OnboardingState {
  setTargetLanguage: (language: TargetLanguage) => void;
  setQuizAnswer: (questionIndex: number, answerIndex: number) => void;
  setQuizScore: (score: number) => void;
  setGoals: (goals: LearningGoal[]) => void;
  toggleGoal: (goal: LearningGoal) => void;
  setSessionsPerWeek: (sessions: number) => void;
  setReminderTime: (time: string | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  resetOnboarding: () => void;
  getOnboardingData: () => OnboardingSubmitData;
}

export interface OnboardingSubmitData {
  target_language: TargetLanguage;
  quiz_score: number;
  goals: LearningGoal[];
  sessions_per_week: number;
  reminder_time: string | null;
  notifications_enabled: boolean;
}

const initialState: OnboardingState = {
  targetLanguage: null,
  quizAnswers: [],
  quizScore: 0,
  goals: [],
  sessionsPerWeek: 3,
  reminderTime: '09:00',
  notificationsEnabled: true,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setTargetLanguage = useCallback((language: TargetLanguage) => {
    setState((prev) => ({ ...prev, targetLanguage: language }));
  }, []);

  const setQuizAnswer = useCallback(
    (questionIndex: number, answerIndex: number) => {
      setState((prev) => {
        const newAnswers = [...prev.quizAnswers];
        newAnswers[questionIndex] = answerIndex;
        return { ...prev, quizAnswers: newAnswers };
      });
    },
    []
  );

  const setQuizScore = useCallback((score: number) => {
    setState((prev) => ({ ...prev, quizScore: score }));
  }, []);

  const setGoals = useCallback((goals: LearningGoal[]) => {
    setState((prev) => ({ ...prev, goals }));
  }, []);

  const toggleGoal = useCallback((goal: LearningGoal) => {
    setState((prev) => {
      const hasGoal = prev.goals.includes(goal);
      if (hasGoal) {
        return { ...prev, goals: prev.goals.filter((g) => g !== goal) };
      } else if (prev.goals.length < 3) {
        return { ...prev, goals: [...prev.goals, goal] };
      }
      return prev; // Max 3 goals
    });
  }, []);

  const setSessionsPerWeek = useCallback((sessions: number) => {
    setState((prev) => ({
      ...prev,
      sessionsPerWeek: Math.max(1, Math.min(7, sessions)),
    }));
  }, []);

  const setReminderTime = useCallback((time: string | null) => {
    setState((prev) => ({ ...prev, reminderTime: time }));
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, notificationsEnabled: enabled }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(initialState);
  }, []);

  const getOnboardingData = useCallback((): OnboardingSubmitData => {
    if (!state.targetLanguage) {
      throw new Error('Target language not selected');
    }
    return {
      target_language: state.targetLanguage,
      quiz_score: state.quizScore,
      goals: state.goals,
      sessions_per_week: state.sessionsPerWeek,
      reminder_time: state.reminderTime,
      notifications_enabled: state.notificationsEnabled,
    };
  }, [state]);

  const value: OnboardingContextType = {
    ...state,
    setTargetLanguage,
    setQuizAnswer,
    setQuizScore,
    setGoals,
    toggleGoal,
    setSessionsPerWeek,
    setReminderTime,
    setNotificationsEnabled,
    resetOnboarding,
    getOnboardingData,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * Hook to access onboarding context.
 */
export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
