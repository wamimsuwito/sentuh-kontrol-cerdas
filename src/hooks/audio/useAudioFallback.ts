
import { useCallback } from 'react';
import { AudioEvent } from './types';
import { useWebAudioAPI } from './useWebAudioAPI';

export const useAudioFallback = () => {
  const { createBeepSound, stopFallbackSound, fallbackIntervalRef } = useWebAudioAPI();

  // Play fallback sound for each event type
  const playFallbackSound = useCallback((event: AudioEvent) => {
    console.log(`🔊 Playing fallback sound for: ${event}`);
    
    // Clear any existing fallback interval for limit-switch-active
    if (event === 'limit-switch-active' && fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    
    switch (event) {
      case 'customer-detected':
        // Two short beeps
        createBeepSound(800, 0.2);
        setTimeout(() => createBeepSound(800, 0.2), 300);
        break;
      case 'limit-switch-active':
        // Continuous beep pattern - store interval reference
        const playLimitSwitchBeep = () => {
          createBeepSound(1000, 0.5);
        };
        playLimitSwitchBeep(); // Play immediately
        fallbackIntervalRef.current = setInterval(playLimitSwitchBeep, 1000);
        break;
      case 'processing-active':
        // Three ascending beeps
        createBeepSound(600, 0.3);
        setTimeout(() => createBeepSound(700, 0.3), 400);
        setTimeout(() => createBeepSound(800, 0.3), 800);
        break;
    }
  }, [createBeepSound, fallbackIntervalRef]);

  return {
    playFallbackSound,
    stopFallbackSound
  };
};
