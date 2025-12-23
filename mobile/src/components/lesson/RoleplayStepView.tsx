/**
 * Roleplay step component for roleplay lessons.
 *
 * Plays a conversational prompt, allows user to record a free-form response,
 * and displays feedback with suggested phrases.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { RoleplayStep } from '../../types';
import { MEDIA_BASE_URL } from '../../api/client';
import colors from '../../styles/colors';

interface RoleplayStepViewProps {
  step: RoleplayStep;
  onComplete: (recordingUri?: string) => void;
}

type Phase = 'listen' | 'respond' | 'feedback';

export default function RoleplayStepView({ step, onComplete }: RoleplayStepViewProps) {
  const [phase, setPhase] = useState<Phase>('listen');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlayingPrompt, setIsPlayingPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasListened, setHasListened] = useState(false);

  const promptSoundRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const playbackSoundRef = useRef<Audio.Sound | null>(null);

  // Build full audio URL
  const promptAudioUrl = step.promptAudioUrl.startsWith('http')
    ? step.promptAudioUrl
    : `${MEDIA_BASE_URL}${step.promptAudioUrl}`;

  // Reset state when step changes
  useEffect(() => {
    // Clean up previous audio/recording
    if (promptSoundRef.current) {
      promptSoundRef.current.unloadAsync();
      promptSoundRef.current = null;
    }
    if (playbackSoundRef.current) {
      playbackSoundRef.current.unloadAsync();
      playbackSoundRef.current = null;
    }
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }

    // Reset all state for new step
    setPhase('listen');
    setIsLoadingAudio(false);
    setIsPlayingPrompt(false);
    setIsRecording(false);
    setIsPlayingRecording(false);
    setRecordingUri(null);
    setError(null);
    setHasListened(false);
  }, [step.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (promptSoundRef.current) {
        promptSoundRef.current.unloadAsync();
      }
      if (playbackSoundRef.current) {
        playbackSoundRef.current.unloadAsync();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // Play the prompt audio
  const playPrompt = async () => {
    try {
      setError(null);
      setIsLoadingAudio(true);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      if (promptSoundRef.current) {
        await promptSoundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: promptAudioUrl },
        { shouldPlay: true },
        (status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlayingPrompt(false);
            setHasListened(true);
          }
        }
      );

      promptSoundRef.current = sound;
      setIsLoadingAudio(false);
      setIsPlayingPrompt(true);
    } catch (err) {
      console.error('Audio playback error:', err);
      setError('Failed to play audio');
      setIsLoadingAudio(false);
      setHasListened(true);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);

      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Microphone permission required');
        return;
      }

      // Stop any playing audio first
      if (promptSoundRef.current) {
        await promptSoundRef.current.stopAsync().catch(() => {});
        await promptSoundRef.current.unloadAsync().catch(() => {});
        promptSoundRef.current = null;
      }
      setIsPlayingPrompt(false);

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setPhase('respond');
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      setIsRecording(false);
      if (uri) {
        setRecordingUri(uri);
        setPhase('feedback');
      }

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch (err) {
      console.error('Stop recording error:', err);
      setError('Failed to save recording');
      setIsRecording(false);
    }
  };

  // Play back the user's recording
  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      setError(null);

      if (playbackSoundRef.current) {
        await playbackSoundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        (status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlayingRecording(false);
          }
        }
      );

      playbackSoundRef.current = sound;
      setIsPlayingRecording(true);
    } catch (err) {
      console.error('Playback error:', err);
      setError('Failed to play recording');
    }
  };

  // Retry recording
  const retryRecording = () => {
    setRecordingUri(null);
    setPhase('listen');
    setHasListened(true);
  };

  // Submit and complete
  const handleComplete = () => {
    onComplete(recordingUri || undefined);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Situation Context */}
      <View style={styles.situationContainer}>
        <Text style={styles.situationLabel}>Situation</Text>
        <Text style={styles.situationText}>{step.situation}</Text>
      </View>

      {/* Prompt Display */}
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>You hear:</Text>
        <Text style={styles.promptText}>{step.prompt}</Text>
        <Text style={styles.promptTranslation}>{step.promptTranslation}</Text>
      </View>

      {/* Task Instruction */}
      <View style={styles.taskContainer}>
        <Text style={styles.taskLabel}>Your task:</Text>
        <Text style={styles.taskText}>{step.taskInstruction}</Text>
      </View>

      {/* Main Interaction Area */}
      <View style={styles.interactionArea}>
        {phase === 'listen' && (
          <View style={styles.phaseContainer}>
            <Text style={styles.instruction}>
              {hasListened ? 'Ready to respond? Tap the microphone!' : 'First, listen to the prompt'}
            </Text>

            <TouchableOpacity
              style={[styles.mainButton, isPlayingPrompt && styles.mainButtonActive]}
              onPress={playPrompt}
              disabled={isLoadingAudio || isPlayingPrompt}
            >
              {isLoadingAudio ? (
                <ActivityIndicator color={colors.white} size="large" />
              ) : (
                <Text style={styles.mainButtonIcon}>
                  {isPlayingPrompt ? '🔊' : '▶️'}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>
              {isPlayingPrompt ? 'Playing...' : 'Tap to listen'}
            </Text>

            {hasListened && (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={startRecording}
              >
                <Text style={styles.recordButtonIcon}>🎤</Text>
                <Text style={styles.recordButtonText}>Record Your Response</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {phase === 'respond' && (
          <View style={styles.phaseContainer}>
            <Text style={styles.instruction}>Recording... Speak your response!</Text>

            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording</Text>
            </View>

            <TouchableOpacity
              style={[styles.mainButton, styles.stopButton]}
              onPress={stopRecording}
            >
              <Text style={styles.mainButtonIcon}>⏹️</Text>
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Tap when finished</Text>
          </View>
        )}

        {phase === 'feedback' && (
          <View style={styles.phaseContainer}>
            <Text style={styles.instruction}>Great job! Here are some suggested responses:</Text>

            {/* Playback controls */}
            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.playbackButton}
                onPress={playPrompt}
                disabled={isPlayingPrompt}
              >
                <Text style={styles.playbackButtonIcon}>🔊</Text>
                <Text style={styles.playbackButtonText}>Prompt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playbackButton}
                onPress={playRecording}
                disabled={isPlayingRecording}
              >
                <Text style={styles.playbackButtonIcon}>🎧</Text>
                <Text style={styles.playbackButtonText}>Your Response</Text>
              </TouchableOpacity>
            </View>

            {/* Suggested Responses */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggested phrases:</Text>
              {step.suggestedResponses.map((response, index) => (
                <View key={index} style={styles.suggestionCard}>
                  <Text style={styles.suggestionPhrase}>{response.phrase}</Text>
                  <Text style={styles.suggestionTranslation}>{response.translation}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.feedbackActions}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryRecording}
              >
                <Text style={styles.retryButtonText}>🔄 Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
              >
                <Text style={styles.completeButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Tip */}
      {step.tip && phase === 'listen' && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipLabel}>💡 Tip</Text>
          <Text style={styles.tipText}>{step.tip}</Text>
        </View>
      )}

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  situationContainer: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  situationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  situationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  promptContainer: {
    backgroundColor: colors.gray50,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  promptLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  promptTranslation: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  taskContainer: {
    backgroundColor: colors.success + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  taskLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  taskText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  interactionArea: {
    marginBottom: 24,
  },
  phaseContainer: {
    alignItems: 'center',
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  mainButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  mainButtonIcon: {
    fontSize: 40,
  },
  buttonLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  recordButtonIcon: {
    fontSize: 20,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  playbackControls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  playbackButton: {
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  playbackButtonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  playbackButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  suggestionsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  suggestionCard: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  suggestionPhrase: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  suggestionTranslation: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.gray200,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  completeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  tipContainer: {
    backgroundColor: colors.primaryLight + '15',
    borderRadius: 12,
    padding: 16,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
  },
});
