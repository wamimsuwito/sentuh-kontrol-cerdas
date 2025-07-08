
import { useRef, useCallback } from 'react';
import { AudioEvent, AUDIO_CONFIG } from './types';

export const useAudioFileManager = () => {
  const audioRefs = useRef<{ [key in AudioEvent]: HTMLAudioElement | null }>({
    'customer-detected': null,
    'limit-switch-active': null,
    'processing-active': null
  });

  const isInitialized = useRef(false);

  // Initialize audio elements
  const initializeAudio = useCallback(() => {
    if (isInitialized.current) {
      console.log('🔊 Audio already initialized, skipping...');
      return;
    }

    console.log('🔊 Initializing audio files...');

    Object.entries(AUDIO_CONFIG).forEach(([event, config]) => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = config.volume;
        
        // Set loop if specified in config
        if (config.loop) {
          audio.loop = true;
        }
        
        // Add error handler - use fallback if file doesn't exist
        audio.addEventListener('error', (e) => {
          console.warn(`⚠️ Audio file not found ${config.file}, will use fallback sound`);
          audioRefs.current[event as AudioEvent] = null;
        });
        
        // Add loaded handler
        audio.addEventListener('canplaythrough', () => {
          console.log(`✅ Audio file loaded: ${config.file}`);
        });
        
        // Set source after adding event listeners
        audio.src = config.file;
        audioRefs.current[event as AudioEvent] = audio;
        console.log(`🔊 Audio initialized for event: ${event}`);
      } catch (error) {
        console.error(`❌ Failed to initialize audio for ${event}:`, error);
        audioRefs.current[event as AudioEvent] = null;
      }
    });

    isInitialized.current = true;
    console.log('✅ Audio manager initialization complete');
  }, []);

  // Play audio file
  const playAudioFile = useCallback((event: AudioEvent, loop: boolean = false): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = audioRefs.current[event];
      
      if (audio && audio.src) {
        // Reset audio to beginning if already playing
        audio.currentTime = 0;
        
        // Set loop if specified
        if (loop) {
          audio.loop = true;
        }
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`🔊 Successfully playing audio for event: ${event}${loop ? ' (looping)' : ''}`);
              resolve(true);
            })
            .catch(error => {
              console.warn(`⚠️ Audio playback failed for ${event}:`, error);
              resolve(false);
            });
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }, []);

  // Stop audio file
  const stopAudioFile = useCallback((event: AudioEvent) => {
    const audio = audioRefs.current[event];
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false; // Reset loop
      console.log(`⏹️ Stopped MP3 audio for event: ${event}`);
    }
  }, []);

  // Stop all audio files
  const stopAllAudioFiles = useCallback(() => {
    Object.keys(audioRefs.current).forEach(event => {
      stopAudioFile(event as AudioEvent);
    });
  }, [stopAudioFile]);

  return {
    audioRefs,
    isInitialized,
    initializeAudio,
    playAudioFile,
    stopAudioFile,
    stopAllAudioFiles
  };
};
