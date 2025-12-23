/**
 * Repeat step component for chunk lessons.
 *
 * Plays a phrase, allows user to record themselves repeating it,
 * and collects a confidence self-assessment.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { RepeatStep } from '../../types';
import { MEDIA_BASE_URL } from '../../api/client';
import colors from '../../styles/colors';

interface RepeatStepViewProps {
  step: RepeatStep;
  onComplete: (confidence: number, recordingUri?: string) => void;
}

type Phase = 'listen' | 'record' | 'review' | 'rate';

export default function RepeatStepView({ step, onComplete }: RepeatStepViewProps) {
  const [phase, setPhase] = useState<Phase>('listen');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [hasListened, setHasListened] = useState(false);

  const originalSoundRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const playbackSoundRef = useRef<Audio.Sound | null>(null);

  // Build full audio URL
  const audioUrl = step.audioUrl.startsWith('http')
    ? step.audioUrl
    : `${MEDIA_BASE_URL}${step.audioUrl}`;

  // Reset state when step changes
  useEffect(() => {
    // Clean up previous audio/recording
    if (originalSoundRef.current) {
      originalSoundRef.current.unloadAsync();
      originalSoundRef.current = null;
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
    setIsPlayingOriginal(false);
    setIsRecording(false);
    setIsPlayingRecording(false);
    setRecordingUri(null);
    setConfidence(3);
    setError(null);
    setHasListened(false);
  }, [step.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (originalSoundRef.current) {
        originalSoundRef.current.unloadAsync();
      }
      if (playbackSoundRef.current) {
        playbackSoundRef.current.unloadAsync();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // Play the original phrase audio
  const playOriginal = async () => {
    try {
      setError(null);
      setIsLoadingAudio(true);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      if (originalSoundRef.current) {
        await originalSoundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlayingOriginal(false);
            setHasListened(true);
          }
        }
      );

      originalSoundRef.current = sound;
      setIsLoadingAudio(false);
      setIsPlayingOriginal(true);
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
      if (originalSoundRef.current) {
        await originalSoundRef.current.stopAsync().catch(() => {});
        await originalSoundRef.current.unloadAsync().catch(() => {});
        originalSoundRef.current = null;
      }
      setIsPlayingOriginal(false);

      // Configure audio mode for recording
      // Important: staysActiveInBackground must be false to avoid "background" error
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
      setPhase('record');
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
        setPhase('review');
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
  };

  // Move to rating phase
  const proceedToRate = () => {
    setPhase('rate');
  };

  // Submit and complete
  const handleComplete = () => {
    onComplete(confidence, recordingUri || undefined);
  };

  const getConfidenceLabel = (value: number): string => {
    switch (value) {
      case 1:
        return 'Not confident at all';
      case 2:
        return 'Slightly confident';
      case 3:
        return 'Somewhat confident';
      case 4:
        return 'Confident';
      case 5:
        return 'Very confident';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Phrase Display */}
      <View style={styles.phraseContainer}>
        <Text style={styles.phraseLabel}>Repeat this phrase:</Text>
        <Text style={styles.phrase}>{step.phrase}</Text>
        <Text style={styles.translation}>{step.translation}</Text>
        {step.phoneticHint && (
          <Text style={styles.phonetic}>📝 {step.phoneticHint}</Text>
        )}
      </View>

      {/* Main Interaction Area */}
      <View style={styles.interactionArea}>
        {phase === 'listen' && (
          <View style={styles.phaseContainer}>
            <Text style={styles.instruction}>
              {hasListened ? 'Ready to record? Tap the microphone!' : 'First, listen to the phrase'}
            </Text>

            <TouchableOpacity
              style={[styles.mainButton, isPlayingOriginal && styles.mainButtonActive]}
              onPress={playOriginal}
              disabled={isLoadingAudio || isPlayingOriginal}
            >
              {isLoadingAudio ? (
                <ActivityIndicator color={colors.white} size="large" />
              ) : (
                <Text style={styles.mainButtonIcon}>
                  {isPlayingOriginal ? '🔊' : '▶️'}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>
              {isPlayingOriginal ? 'Playing...' : 'Tap to listen'}
            </Text>

            {hasListened && (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={startRecording}
              >
                <Text style={styles.recordButtonIcon}>🎤</Text>
                <Text style={styles.recordButtonText}>Start Recording</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {phase === 'record' && (
          <View style={styles.phaseContainer}>
            <Text style={styles.instruction}>Recording... Tap when done!</Text>

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
            <Text style={styles.buttonLabel}>Tap to stop</Text>
          </View>
        )}

        {phase === 'review' && (
          <View style={styles.phaseContainer}>
            <Text style={styles.instruction}>Review your recording</Text>

            <View style={styles.reviewButtons}>
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={playOriginal}
                disabled={isPlayingOriginal}
              >
                <Text style={styles.reviewButtonIcon}>🔊</Text>
                <Text style={styles.reviewButtonText}>Original</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reviewButton}
                onPress={playRecording}
                disabled={isPlayingRecording}
              >
                <Text style={styles.reviewButtonIcon}>🎧</Text>
                <Text style={styles.reviewButtonText}>Yours</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryRecording}
              >
                <Text style={styles.retryButtonText}>🔄 Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.proceedButton}
                onPress={proceedToRate}
              >
                <Text style={styles.proceedButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {phase === 'rate' && (
          <View style={styles.phaseContainer}>
            <Text style={styles.instruction}>How confident do you feel?</Text>

            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceButtons}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.confidenceButton,
                      confidence === value && styles.confidenceButtonSelected,
                    ]}
                    onPress={() => setConfidence(value)}
                  >
                    <Text style={styles.confidenceEmoji}>
                      {value === 1 ? '😟' : value === 2 ? '😕' : value === 3 ? '😐' : value === 4 ? '🙂' : '😊'}
                    </Text>
                    <Text style={[
                      styles.confidenceNumber,
                      confidence === value && styles.confidenceNumberSelected,
                    ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.confidenceText}>
                {getConfidenceLabel(confidence)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
            >
              <Text style={styles.completeButtonText}>Continue</Text>
            </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  phraseContainer: {
    backgroundColor: colors.gray50,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  phraseLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  phrase: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  translation: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  phonetic: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 8,
  },
  interactionArea: {
    flex: 1,
    justifyContent: 'center',
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
  reviewButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  reviewButton: {
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  reviewButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reviewActions: {
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
  proceedButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  confidenceContainer: {
    width: '100%',
    marginBottom: 32,
  },
  confidenceButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  confidenceButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  confidenceButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '30',
  },
  confidenceEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  confidenceNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confidenceNumberSelected: {
    color: colors.primary,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 16,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
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
    marginTop: 'auto',
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
