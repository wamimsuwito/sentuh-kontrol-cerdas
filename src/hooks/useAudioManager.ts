
import { useCallback, useRef } from 'react';

export type AudioEvent = 'customer-detected' | 'limit-switch-active' | 'processing-active';

export const useAudioManager = () => {
  const audioRefs = useRef<{ [key in AudioEvent]: HTMLAudioElement | null }>({
    'customer-detected': null,
    'limit-switch-active': null,
    'processing-active': null
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const isInitialized = useRef(false);

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

  // Play fallback sound for each event type
  const playFallbackSound = useCallback((event: AudioEvent) => {
    console.log(`🔊 Playing fallback sound for: ${event}`);
    
    switch (event) {
      case 'customer-detected':
        // Two short beeps
        createBeepSound(800, 0.2);
        setTimeout(() => createBeepSound(800, 0.2), 300);
        break;
      case 'limit-switch-active':
        // Continuous beep pattern
        const playLimitSwitchBeep = () => {
          createBeepSound(1000, 0.5);
          setTimeout(playLimitSwitchBeep, 1000);
        };
        playLimitSwitchBeep();
        break;
      case 'processing-active':
        // Three ascending beeps
        createBeepSound(600, 0.3);
        setTimeout(() => createBeepSound(700, 0.3), 400);
        setTimeout(() => createBeepSound(800, 0.3), 800);
        break;
    }
  }, [createBeepSound]);

  // Initialize audio elements
  const initializeAudio = useCallback(() => {
    if (isInitialized.current) {
      console.log('🔊 Audio already initialized, skipping...');
      return;
    }

    console.log('🔊 Initializing audio files...');
    
    const audioFiles = {
      'customer-detected': '/audio/customer-detected.mp3',
      'limit-switch-active': '/audio/limit-switch-active.mp3',
      'processing-active': '/audio/processing-active.mp3'
    };

    Object.entries(audioFiles).forEach(([event, filePath]) => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 0.8;
        
        // Set limit-switch-active to loop continuously
        if (event === 'limit-switch-active') {
          audio.loop = true;
        }
        
        // Add error handler - use fallback if file doesn't exist
        audio.addEventListener('error', (e) => {
          console.warn(`⚠️ Audio file not found ${filePath}, will use fallback sound`);
          audioRefs.current[event as AudioEvent] = null;
        });
        
        // Add loaded handler
        audio.addEventListener('canplaythrough', () => {
          console.log(`✅ Audio file loaded: ${filePath}`);
        });
        
        // Set source after adding event listeners
        audio.src = filePath;
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

  const playAudio = useCallback((event: AudioEvent, loop: boolean = false) => {
    try {
      // Initialize audio if not already done
      if (!isInitialized.current) {
        console.log('🔊 Audio not initialized, initializing now...');
        initializeAudio();
      }

      const audio = audioRefs.current[event];
      
      // If audio file is available, try to play it
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
            })
            .catch(error => {
              console.warn(`⚠️ Audio playback failed for ${event}, using fallback:`, error);
              playFallbackSound(event);
            });
        }
      } else {
        // Use fallback sound if audio file is not available
        console.log(`🔊 Using fallback sound for event: ${event}`);
        playFallbackSound(event);
      }
    } catch (error) {
      console.error(`❌ Error playing audio for ${event}, using fallback:`, error);
      playFallbackSound(event);
    }
  }, [initializeAudio, playFallbackSound]);

  const stopAudio = useCallback((event: AudioEvent) => {
    try {
      const audio = audioRefs.current[event];
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false; // Reset loop
        console.log(`⏹️ Stopped audio for event: ${event}`);
      }
      
      // For limit-switch-active, also stop any ongoing fallback sounds
      if (event === 'limit-switch-active' && audioContextRef.current) {
        // Note: We can't easily stop ongoing oscillators, but they'll stop naturally
        console.log(`⏹️ Attempted to stop fallback audio for: ${event}`);
      }
    } catch (error) {
      console.error(`❌ Error stopping audio for ${event}:`, error);
    }
  }, []);

  const stopAllAudio = useCallback(() => {
    console.log('⏹️ Stopping all audio...');
    Object.keys(audioRefs.current).forEach(event => {
      stopAudio(event as AudioEvent);
    });
    
    // Close audio context if exists
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopAudio]);

  return {
    playAudio,
    stopAudio,
    stopAllAudio,
    initializeAudio
  };
};
