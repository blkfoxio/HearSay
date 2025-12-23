/**
 * Reveal step component for gist lessons.
 *
 * Shows transcript, translation, and key phrases after answering.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { RevealStep } from '../../types';
import colors from '../../styles/colors';

interface RevealStepViewProps {
  step: RevealStep;
  wasCorrect: boolean;
  onContinue: () => void;
}

export default function RevealStepView({
  step,
  wasCorrect,
  onContinue,
}: RevealStepViewProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Result Banner */}
      <View style={[styles.resultBanner, wasCorrect ? styles.correctBanner : styles.incorrectBanner]}>
        <Text style={styles.resultEmoji}>{wasCorrect ? '🎉' : '💪'}</Text>
        <Text style={styles.resultText}>
          {wasCorrect ? 'Great job!' : 'Keep practicing!'}
        </Text>
      </View>

      {/* Correct Answer */}
      <View style={styles.answerSection}>
        <Text style={styles.sectionLabel}>Correct Answer</Text>
        <Text style={styles.correctAnswer}>{step.correctAnswer}</Text>
      </View>

      {/* Transcript */}
      <View style={styles.transcriptSection}>
        <View style={styles.transcriptHeader}>
          <Text style={styles.sectionLabel}>Transcript</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowTranslation(!showTranslation)}
          >
            <Text style={styles.toggleButtonText}>
              {showTranslation ? 'Hide Translation' : 'Show Translation'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transcriptCard}>
          <Text style={styles.transcript}>{step.transcript}</Text>
          {showTranslation && (
            <View style={styles.translationContainer}>
              <View style={styles.divider} />
              <Text style={styles.translation}>{step.translation}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Key Phrases */}
      {step.keyPhrases && step.keyPhrases.length > 0 && (
        <View style={styles.phrasesSection}>
          <Text style={styles.sectionLabel}>Key Phrases</Text>
          <View style={styles.phrasesList}>
            {step.keyPhrases.map((phrase, index) => {
              // Get the keys from the phrase object
              const keys = Object.keys(phrase);
              const foreignKey = keys.find(k => k !== 'english') || keys[0];
              const foreignValue = phrase[foreignKey];
              const englishValue = phrase['english'] || phrase[keys[1]];

              return (
                <View key={index} style={styles.phraseItem}>
                  <Text style={styles.phraseOriginal}>{foreignValue}</Text>
                  <Text style={styles.phraseTranslation}>{englishValue}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Tip */}
      {step.tip && (
        <View style={styles.tipSection}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipLabel}>Tip</Text>
          </View>
          <Text style={styles.tipText}>{step.tip}</Text>
        </View>
      )}

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  correctBanner: {
    backgroundColor: colors.success + '15',
  },
  incorrectBanner: {
    backgroundColor: colors.warning + '15',
  },
  resultEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  answerSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  correctAnswer: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  transcriptSection: {
    marginBottom: 24,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  transcriptCard: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
  },
  transcript: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  translationContainer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginBottom: 12,
  },
  translation: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  phrasesSection: {
    marginBottom: 24,
  },
  phrasesList: {
    gap: 8,
  },
  phraseItem: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phraseOriginal: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  phraseTranslation: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  tipSection: {
    backgroundColor: colors.info + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
