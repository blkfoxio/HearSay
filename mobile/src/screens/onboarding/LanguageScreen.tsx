/**
 * Language selection screen.
 *
 * First step of onboarding - choose Spanish or French.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList, TargetLanguage } from '../../types';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { colors } from '../../styles/colors';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Language'>;
};

export default function LanguageScreen({ navigation }: Props) {
  const { targetLanguage, setTargetLanguage } = useOnboarding();
  const [selected, setSelected] = useState<TargetLanguage | null>(targetLanguage);

  const handleSelectLanguage = (language: TargetLanguage) => {
    setSelected(language);
  };

  const handleContinue = () => {
    if (selected) {
      setTargetLanguage(selected);
      navigation.navigate('Quiz');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>What language do you want to learn?</Text>
          <Text style={styles.subtitle}>
            Choose one to get started. You can add more later.
          </Text>
        </View>

        <View style={styles.languageOptions}>
          <TouchableOpacity
            style={[
              styles.languageCard,
              selected === 'es' && styles.languageCardSelected,
            ]}
            onPress={() => handleSelectLanguage('es')}
            activeOpacity={0.7}
          >
            <Text style={styles.languageFlag}>🇪🇸</Text>
            <Text style={styles.languageName}>Spanish</Text>
            <Text style={styles.languageRegion}>Spain & Latin America</Text>
            {selected === 'es' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageCard,
              selected === 'fr' && styles.languageCardSelected,
            ]}
            onPress={() => handleSelectLanguage('fr')}
            activeOpacity={0.7}
          >
            <Text style={styles.languageFlag}>🇫🇷</Text>
            <Text style={styles.languageName}>French</Text>
            <Text style={styles.languageRegion}>France & French-speaking world</Text>
            {selected === 'fr' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!selected}
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
    marginBottom: 40,
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
  languageOptions: {
    gap: 16,
  },
  languageCard: {
    backgroundColor: colors.gray50,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  languageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  languageFlag: {
    fontSize: 48,
    marginBottom: 12,
  },
  languageName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  languageRegion: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
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
