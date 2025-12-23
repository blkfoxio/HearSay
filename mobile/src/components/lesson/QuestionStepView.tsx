/**
 * Question step component for gist lessons.
 *
 * Displays a multiple-choice question with options.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { QuestionStep } from '../../types';
import colors from '../../styles/colors';

interface QuestionStepViewProps {
  step: QuestionStep;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  onContinue: () => void;
}

export default function QuestionStepView({
  step,
  onAnswer,
  onContinue,
}: QuestionStepViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionPress = (index: number) => {
    if (hasAnswered) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setHasAnswered(true);
    const isCorrect = selectedIndex === step.correctIndex;
    onAnswer(selectedIndex, isCorrect);
  };

  const getOptionStyle = (index: number) => {
    if (!hasAnswered) {
      return selectedIndex === index ? styles.optionSelected : styles.option;
    }

    // Show correct/incorrect after answering
    if (index === step.correctIndex) {
      return styles.optionCorrect;
    }
    if (index === selectedIndex && index !== step.correctIndex) {
      return styles.optionIncorrect;
    }
    return styles.option;
  };

  const getOptionTextStyle = (index: number) => {
    if (!hasAnswered) {
      return selectedIndex === index
        ? styles.optionTextSelected
        : styles.optionText;
    }

    if (index === step.correctIndex) {
      return styles.optionTextCorrect;
    }
    if (index === selectedIndex && index !== step.correctIndex) {
      return styles.optionTextIncorrect;
    }
    return styles.optionText;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{step.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {step.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleOptionPress(index)}
            disabled={hasAnswered}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.optionIndicator,
                  selectedIndex === index && !hasAnswered && styles.optionIndicatorSelected,
                  hasAnswered && index === step.correctIndex && styles.optionIndicatorCorrect,
                  hasAnswered && index === selectedIndex && index !== step.correctIndex && styles.optionIndicatorIncorrect,
                ]}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={getOptionTextStyle(index)}>{option}</Text>
            </View>
            {hasAnswered && index === step.correctIndex && (
              <Text style={styles.correctBadge}>✓</Text>
            )}
            {hasAnswered && index === selectedIndex && index !== step.correctIndex && (
              <Text style={styles.incorrectBadge}>✗</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {hasAnswered && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationLabel}>
            {selectedIndex === step.correctIndex ? '🎉 Correct!' : '💡 Explanation'}
          </Text>
          <Text style={styles.explanationText}>{step.explanation}</Text>
        </View>
      )}

      {hasAnswered && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      )}

      {!hasAnswered && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedIndex === null && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={selectedIndex === null}
        >
          <Text
            style={[
              styles.submitButtonText,
              selectedIndex === null && styles.submitButtonTextDisabled,
            ]}
          >
            Check Answer
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  questionContainer: {
    marginBottom: 32,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  option: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    backgroundColor: colors.primaryLight + '15',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCorrect: {
    backgroundColor: colors.success + '15',
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionIncorrect: {
    backgroundColor: colors.error + '15',
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIndicatorSelected: {
    backgroundColor: colors.primary,
  },
  optionIndicatorCorrect: {
    backgroundColor: colors.success,
  },
  optionIndicatorIncorrect: {
    backgroundColor: colors.error,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  optionTextSelected: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  optionTextCorrect: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '500',
    flex: 1,
  },
  optionTextIncorrect: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
    flex: 1,
  },
  correctBadge: {
    fontSize: 20,
    color: colors.success,
    marginLeft: 8,
  },
  incorrectBadge: {
    fontSize: 20,
    color: colors.error,
    marginLeft: 8,
  },
  explanationContainer: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  explanationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray200,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  submitButtonTextDisabled: {
    color: colors.gray400,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
