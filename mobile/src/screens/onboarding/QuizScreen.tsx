/**
 * Quick assessment quiz screen.
 *
 * 5 multiple choice questions to assess proficiency level.
 * Score determines initial proficiency: beginner → upper_intermediate
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList, TargetLanguage } from '../../types';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { colors } from '../../styles/colors';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Quiz'>;
};

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

// Quiz questions by language
const quizQuestions: Record<TargetLanguage, QuizQuestion[]> = {
  es: [
    {
      id: 1,
      question: 'What does "Hola" mean?',
      options: ['Goodbye', 'Hello', 'Thank you', 'Please'],
      correctIndex: 1,
    },
    {
      id: 2,
      question: 'How do you say "Thank you" in Spanish?',
      options: ['Por favor', 'De nada', 'Gracias', 'Perdón'],
      correctIndex: 2,
    },
    {
      id: 3,
      question: 'What does "¿Dónde está el baño?" mean?',
      options: [
        'What time is it?',
        'Where is the bathroom?',
        'How are you?',
        'What is your name?',
      ],
      correctIndex: 1,
    },
    {
      id: 4,
      question: 'Choose the correct conjugation: "Yo ___ español"',
      options: ['hablas', 'hablo', 'habla', 'hablamos'],
      correctIndex: 1,
    },
    {
      id: 5,
      question: 'What does "Me gustaría una mesa para dos" mean?',
      options: [
        'I would like a table for two',
        'The table has two chairs',
        'Can I have the menu?',
        'Where is the restaurant?',
      ],
      correctIndex: 0,
    },
  ],
  fr: [
    {
      id: 1,
      question: 'What does "Bonjour" mean?',
      options: ['Goodbye', 'Hello/Good day', 'Thank you', 'Please'],
      correctIndex: 1,
    },
    {
      id: 2,
      question: 'How do you say "Thank you" in French?',
      options: ["S'il vous plaît", 'De rien', 'Merci', 'Pardon'],
      correctIndex: 2,
    },
    {
      id: 3,
      question: 'What does "Où sont les toilettes?" mean?',
      options: [
        'What time is it?',
        'Where are the toilets?',
        'How are you?',
        'What is your name?',
      ],
      correctIndex: 1,
    },
    {
      id: 4,
      question: 'Choose the correct conjugation: "Je ___ français"',
      options: ['parles', 'parle', 'parlent', 'parlons'],
      correctIndex: 1,
    },
    {
      id: 5,
      question: 'What does "Je voudrais une table pour deux" mean?',
      options: [
        'I would like a table for two',
        'The table has two chairs',
        'Can I have the menu?',
        'Where is the restaurant?',
      ],
      correctIndex: 0,
    },
  ],
};

export default function QuizScreen({ navigation }: Props) {
  const { targetLanguage, setQuizAnswer, setQuizScore } = useOnboarding();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(5).fill(null)
  );

  const questions = useMemo(
    () => quizQuestions[targetLanguage || 'es'],
    [targetLanguage]
  );

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasSelected = selectedAnswers[currentQuestion] !== null;

  const handleSelectAnswer = (index: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = index;
    setSelectedAnswers(newAnswers);
    setQuizAnswer(currentQuestion, index);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate score
      let score = 0;
      selectedAnswers.forEach((answer, index) => {
        if (answer !== null && answer === questions[index].correctIndex) {
          score += 1;
        }
      });
      setQuizScore(score);
      navigation.navigate('Personas');
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Progress indicator
  const progressWidth = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentQuestion + 1} of {questions.length}
          </Text>
        </View>

        {/* Question */}
        <ScrollView
          style={styles.questionContainer}
          contentContainerStyle={styles.questionContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswers[currentQuestion] === index &&
                    styles.optionButtonSelected,
                ]}
                onPress={() => handleSelectAnswer(index)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionRadio,
                    selectedAnswers[currentQuestion] === index &&
                      styles.optionRadioSelected,
                  ]}
                >
                  {selectedAnswers[currentQuestion] === index && (
                    <View style={styles.optionRadioInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswers[currentQuestion] === index &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Navigation buttons */}
        <View style={styles.footer}>
          {currentQuestion > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              !hasSelected && styles.nextButtonDisabled,
              currentQuestion === 0 && styles.nextButtonFull,
            ]}
            onPress={handleNext}
            disabled={!hasSelected}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? 'Continue' : 'Next'}
            </Text>
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
    paddingTop: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  questionContainer: {
    flex: 1,
  },
  questionContent: {
    paddingBottom: 20,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray300,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: colors.primary,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 24,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.gray100,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
