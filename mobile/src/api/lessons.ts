/**
 * Lessons API module.
 *
 * Handles lesson data fetching and attempt tracking.
 */

import { apiRequest } from './client';
import {
  Scenario,
  Lesson,
  LessonAttempt,
  TodayPlan,
  StepResponse,
} from '../types';

/**
 * Fetch all scenarios for a language.
 */
export async function getScenarios(language?: string): Promise<Scenario[]> {
  const params = language ? `?language=${language}` : '';
  return apiRequest<Scenario[]>(`/scenarios/${params}`);
}

/**
 * Fetch lessons, optionally filtered by scenario or type.
 */
export async function getLessons(options?: {
  scenarioId?: number;
  lessonType?: string;
}): Promise<Lesson[]> {
  const params = new URLSearchParams();
  if (options?.scenarioId) params.append('scenario', options.scenarioId.toString());
  if (options?.lessonType) params.append('type', options.lessonType);

  const queryString = params.toString();
  return apiRequest<Lesson[]>(`/lessons/${queryString ? `?${queryString}` : ''}`);
}

/**
 * Fetch a specific lesson with all steps.
 */
export async function getLesson(lessonId: number): Promise<Lesson> {
  return apiRequest<Lesson>(`/lessons/${lessonId}/`);
}

/**
 * Get today's recommended lessons.
 */
export async function getTodayPlan(): Promise<TodayPlan> {
  return apiRequest<TodayPlan>('/plan/today/');
}

/**
 * Start a lesson attempt.
 */
export async function startLessonAttempt(lessonId: number): Promise<LessonAttempt> {
  return apiRequest<LessonAttempt>(`/lessons/${lessonId}/attempts/`, {
    method: 'POST',
  });
}

/**
 * Submit a lesson attempt with responses.
 */
export async function submitLessonAttempt(
  lessonId: number,
  attemptId: number,
  data: {
    responses: StepResponse[];
    score: number;
    durationSeconds: number;
  }
): Promise<LessonAttempt> {
  return apiRequest<LessonAttempt>(`/lessons/${lessonId}/attempts/`, {
    method: 'POST',
    body: JSON.stringify({
      id: attemptId,
      completed: true,
      ...data,
    }),
  });
}

/**
 * Get user's attempts for a lesson.
 */
export async function getLessonAttempts(lessonId: number): Promise<LessonAttempt[]> {
  return apiRequest<LessonAttempt[]>(`/lessons/${lessonId}/attempts/`);
}
