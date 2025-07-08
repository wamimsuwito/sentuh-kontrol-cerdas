
import { useRef, useCallback } from 'react';
import { AudioEvent } from './types';

export const useWebAudioAPI = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create fallback beep sound using Web Audio API
  const createBeepSound = useCallback((frequency: number, duration: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
    
    return oscillator;
  }, []);

  // Stop fallback sound
  const stopFallbackSound = useCallback((event: AudioEvent) => {
    if (event === 'limit-switch-active' && fallbackIntervalRef.current) {
      console.log('⏹️ Stopping fallback limit switch sound');
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
  }, []);

  // Close audio context
  const closeAudioContext = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  return {
    createBeepSound,
    stopFallbackSound,
    closeAudioContext,
    fallbackIntervalRef
  };
};
