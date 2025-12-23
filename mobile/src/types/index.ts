/**
 * Core type definitions for HearSay mobile app.
 */

// User types
export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  ssoProvider: 'apple' | 'google' | 'email' | null;
  onboardingCompleted: boolean;
  profile: UserProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  targetLanguage: 'es' | 'fr';
  nativeLanguage: string;
  proficiencyLevel: ProficiencyLevel;
  sessionsPerWeek: number;
  sessionDurationMinutes: number;
  notificationsEnabled: boolean;
  reminderTime: string | null;
  timezone: string;
  totalLessonsCompleted: number;
  totalPracticeMinutes: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProficiencyLevel =
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'upper_intermediate'
  | 'advanced';

export type TargetLanguage = 'es' | 'fr';

// Auth types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SSOCredentials {
  provider: 'apple' | 'google';
  idToken: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

// API types
export interface ApiError {
  detail: string;
  code?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

export type OnboardingStackParamList = {
  Language: undefined;
  Quiz: undefined;
  Personas: undefined;
  Schedule: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Lessons: undefined;
  Phrasebook: undefined;
  Profile: undefined;
};

export type LessonsStackParamList = {
  LessonList: undefined;
  LessonPlayer: { lessonId: number };
  LessonComplete: { lessonId: number; score: number };
};

// Lesson types
export type LessonType = 'gist' | 'chunk' | 'roleplay';
export type DifficultyLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';

export interface Scenario {
  id: number;
  title: string;
  description: string;
  contextTags: string[];
  language: TargetLanguage;
  difficulty: DifficultyLevel;
  imageUrl: string | null;
  lessonCount: number;
}

export interface Lesson {
  id: number;
  scenarioId: number;
  scenarioTitle: string;
  lessonType: LessonType;
  title: string;
  description: string;
  order: number;
  steps: LessonStep[];
  estimatedMinutes: number;
}

// Lesson steps
export type LessonStep = AudioStep | QuestionStep | RevealStep | RepeatStep | RoleplayStep;

export interface AudioStep {
  type: 'audio';
  id: string;
  audioUrl: string;
  title: string;
  description: string;
}

export interface QuestionStep {
  type: 'question';
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  audioUrl?: string;
  explanation: string;
}

export interface KeyPhrase {
  [key: string]: string; // e.g., { spanish: "Hola", english: "Hello" }
}

export interface RevealStep {
  type: 'reveal';
  id: string;
  correctAnswer: string;
  transcript: string;
  translation: string;
  keyPhrases?: KeyPhrase[];
  tip?: string;
}

export interface RepeatStep {
  type: 'repeat';
  id: string;
  audioUrl: string;
  phrase: string;
  translation: string;
  phoneticHint?: string;
  tip?: string;
}

export interface SuggestedResponse {
  phrase: string;
  translation: string;
}

export interface RoleplayStep {
  type: 'roleplay';
  id: string;
  promptAudioUrl: string;
  situation: string;
  prompt: string;
  promptTranslation: string;
  taskInstruction: string;
  suggestedResponses: SuggestedResponse[];
  tip?: string;
}

// Attempt types
export interface LessonAttempt {
  id: number;
  lessonId: number;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  responses: StepResponse[];
  durationSeconds: number | null;
}

export interface StepResponse {
  stepId: string;
  selectedIndex?: number;
  correct?: boolean;
  confidence?: number; // 1-5 for repeat steps self-assessment
  recordingUri?: string; // Local URI of recorded audio
  timestamp: string;
}

// Today's plan
export interface TodayPlan {
  date: string;
  lessons: Lesson[];
  completedToday: number;
  totalMinutes: number;
}
