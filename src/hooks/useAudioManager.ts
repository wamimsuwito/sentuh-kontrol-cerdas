
import { useCallback } from 'react';
import { AudioEvent } from './audio/types';
import { useAudioFileManager } from './audio/useAudioFileManager';
import { useAudioFallback } from './audio/useAudioFallback';
import { useWebAudioAPI } from './audio/useWebAudioAPI';

export type { AudioEvent } from './audio/types';

export const useAudioManager = () => {
  const { 
    initializeAudio, 
    playAudioFile, 
    stopAudioFile, 
    stopAllAudioFiles,
    isInitialized 
  } = useAudioFileManager();
  
  const { playFallbackSound, stopFallbackSound } = useAudioFallback();
  const { closeAudioContext } = useWebAudioAPI();

  const playAudio = useCallback(async (event: AudioEvent, loop: boolean = false) => {
    try {
      // Initialize audio if not already done
      if (!isInitialized.current) {
        console.log('🔊 Audio not initialized, initializing now...');
        initializeAudio();
      }

      // Try to play audio file first
      const audioPlayed = await playAudioFile(event, loop);
      
      // If audio file failed, use fallback sound
      if (!audioPlayed) {
        console.log(`🔊 Using fallback sound for event: ${event}`);
        playFallbackSound(event);
      }
    } catch (error) {
      console.error(`❌ Error playing audio for ${event}, using fallback:`, error);
      playFallbackSound(event);
    }
  }, [initializeAudio, playAudioFile, playFallbackSound, isInitialized]);

  const stopAudio = useCallback((event: AudioEvent) => {
    try {
      console.log(`⏹️ Stopping audio for event: ${event}`);
      
      // Stop both file audio and fallback sound
      stopAudioFile(event);
      stopFallbackSound(event);
      
    } catch (error) {
      console.error(`❌ Error stopping audio for ${event}:`, error);
      // Try to stop fallback sound anyway
      stopFallbackSound(event);
    }
  }, [stopAudioFile, stopFallbackSound]);

  const stopAllAudio = useCallback(() => {
    console.log('⏹️ Stopping all audio...');
    
    // Stop all file audio
    stopAllAudioFiles();
    
    // Stop fallback sounds for each event
    Object.keys({ 'customer-detected': null, 'limit-switch-active': null, 'processing-active': null }).forEach(event => {
      stopFallbackSound(event as AudioEvent);
    });
    
    // Close audio context
    closeAudioContext();
  }, [stopAllAudioFiles, stopFallbackSound, closeAudioContext]);

  return {
    playAudio,
    stopAudio,
    stopAllAudio,
    initializeAudio
  };
};
