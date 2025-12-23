/**
 * LessonRunner component.
 *
 * Orchestrates the lesson flow through all steps (audio, questions, reveals).
 * Tracks progress and responses for scoring.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Lesson,
  StepResponse,
  AudioStep,
  QuestionStep,
  RevealStep,
  RepeatStep,
  RoleplayStep,
} from '../../types';
import colors from '../../styles/colors';
import AudioStepView from './AudioStepView';
import QuestionStepView from './QuestionStepView';
import RevealStepView from './RevealStepView';
import RepeatStepView from './RepeatStepView';
import RoleplayStepView from './RoleplayStepView';

interface LessonRunnerProps {
  lesson: Lesson;
  onComplete: (responses: StepResponse[], score: number) => void;
  onExit: () => void;
}

export default function LessonRunner({
  lesson,
  onComplete,
  onExit,
}: LessonRunnerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<StepResponse[]>([]);
  const [lastQuestionCorrect, setLastQuestionCorrect] = useState<boolean | null>(null);
  const [startTime] = useState(Date.now());

  const currentStep = lesson.steps[currentStepIndex];
  const totalSteps = lesson.steps.length;
  const progress = (currentStepIndex + 1) / totalSteps;

  // Calculate score from responses
  const calculateScore = useCallback((allResponses: StepResponse[]) => {
    const questionResponses = allResponses.filter(r => r.correct !== undefined);
    if (questionResponses.length === 0) return 1;
    const correctCount = questionResponses.filter(r => r.correct).length;
    return correctCount / questionResponses.length;
  }, []);

  // Move to next step
  const goToNextStep = useCallback(() => {
    if (currentStepIndex + 1 >= totalSteps) {
      // Lesson complete
      const score = calculateScore(responses);
      onComplete(responses, score);
    } else {
      setCurrentStepIndex(prev => prev + 1);
      setLastQuestionCorrect(null);
    }
  }, [currentStepIndex, totalSteps, responses, calculateScore, onComplete]);

  // Handle audio step completion
  const handleAudioComplete = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  // Handle question answer
  const handleQuestionAnswer = useCallback(
    (selectedIndex: number, isCorrect: boolean) => {
      const response: StepResponse = {
        stepId: currentStep.id,
        selectedIndex,
        correct: isCorrect,
        timestamp: new Date().toISOString(),
      };
      setResponses(prev => [...prev, response]);
      setLastQuestionCorrect(isCorrect);
      // Don't auto-advance - wait for reveal step
    },
    [currentStep]
  );

  // Handle reveal continue
  const handleRevealContinue = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  // Handle repeat step completion
  const handleRepeatComplete = useCallback(
    (confidence: number, recordingUri?: string) => {
      const response: StepResponse = {
        stepId: currentStep.id,
        confidence,
        recordingUri,
        timestamp: new Date().toISOString(),
      };
      setResponses(prev => [...prev, response]);
      goToNextStep();
    },
    [currentStep, goToNextStep]
  );

  // Handle roleplay step completion
  const handleRoleplayComplete = useCallback(
    (recordingUri?: string) => {
      const response: StepResponse = {
        stepId: currentStep.id,
        recordingUri,
        timestamp: new Date().toISOString(),
      };
      setResponses(prev => [...prev, response]);
      goToNextStep();
    },
    [currentStep, goToNextStep]
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep.type) {
      case 'audio':
        return (
          <AudioStepView
            step={currentStep as AudioStep}
            onComplete={handleAudioComplete}
          />
        );

      case 'question':
        return (
          <QuestionStepView
            step={currentStep as QuestionStep}
            onAnswer={handleQuestionAnswer}
            onContinue={goToNextStep}
          />
        );

      case 'reveal':
        // For reveal steps, check if last question was answered
        const wasCorrect = lastQuestionCorrect ?? true;
        return (
          <RevealStepView
            step={currentStep as RevealStep}
            wasCorrect={wasCorrect}
            onContinue={handleRevealContinue}
          />
        );

      case 'repeat':
        return (
          <RepeatStepView
            step={currentStep as RepeatStep}
            onComplete={handleRepeatComplete}
          />
        );

      case 'roleplay':
        return (
          <RoleplayStepView
            step={currentStep as RoleplayStep}
            onComplete={handleRoleplayComplete}
          />
        );

      default:
        return (
          <View style={styles.unknownStep}>
            <Text style={styles.unknownStepText}>Unknown step type</Text>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={goToNextStep}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStepIndex + 1} / {totalSteps}
          </Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Step Content */}
      <View style={styles.stepContainer}>{renderStep()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  stepContainer: {
    flex: 1,
  },
  unknownStep: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  unknownStepText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.gray200,
    borderRadius: 8,
  },
  skipButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
});
