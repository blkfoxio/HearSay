/**
 * Audio step component for gist lessons.
 *
 * Displays audio player with title and description.
 * Uses expo-av for audio playback.
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
import { AudioStep } from '../../types';
import { MEDIA_BASE_URL } from '../../api/client';
import colors from '../../styles/colors';

interface AudioStepViewProps {
  step: AudioStep;
  onComplete: () => void;
}

export default function AudioStepView({ step, onComplete }: AudioStepViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Build full audio URL
  const audioUrl = step.audioUrl.startsWith('http')
    ? step.audioUrl
    : `${MEDIA_BASE_URL}${step.audioUrl}`;

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handlePlay = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Load and play the audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsLoading(false);
      setIsPlaying(true);
    } catch (err) {
      console.error('Audio playback error:', err);
      setError('Failed to play audio');
      setIsLoading(false);
      // Allow continuing even if audio fails
      setHasPlayed(true);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        setIsPlaying(false);
        setHasPlayed(true);
      }
    }
  };

  const handleStop = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
      setHasPlayed(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
      </View>

      <View style={styles.playerContainer}>
        <View style={styles.playerCard}>
          <View style={styles.waveform}>
            {/* Waveform visualization */}
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: 10 + Math.random() * 30,
                    opacity: isPlaying ? 1 : 0.4,
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.playButton,
              isPlaying && styles.playButtonActive,
            ]}
            onPress={isPlaying ? handleStop : handlePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : isPlaying ? (
              <Text style={styles.playIcon}>⏹️</Text>
            ) : (
              <Text style={styles.playIcon}>{hasPlayed ? '🔄' : '▶️'}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.audioHint}>
            {isLoading
              ? 'Loading audio...'
              : isPlaying
              ? 'Tap to stop'
              : hasPlayed
              ? 'Tap to replay'
              : 'Tap to play audio'}
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !hasPlayed && styles.continueButtonDisabled]}
        onPress={onComplete}
        disabled={!hasPlayed}
      >
        <Text
          style={[
            styles.continueButtonText,
            !hasPlayed && styles.continueButtonTextDisabled,
          ]}
        >
          Continue
        </Text>
      </TouchableOpacity>

      {!hasPlayed && (
        <Text style={styles.hint}>Listen to the audio to continue</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerCard: {
    backgroundColor: colors.gray100,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginBottom: 24,
    gap: 3,
  },
  waveBar: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  playButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  playIcon: {
    fontSize: 28,
  },
  audioHint: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonDisabled: {
    backgroundColor: colors.gray200,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  continueButtonTextDisabled: {
    color: colors.gray400,
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
});
