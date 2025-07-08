
import { useState, useCallback, useRef, useEffect } from 'react';
import { useBarcodeDisplaySettings } from './useBarcodeDisplaySettings';

export const useButtonTimer = () => {
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const buttonTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef<(() => void) | null>(null);
  const { getBarcodeDisplayTime } = useBarcodeDisplaySettings();

  // Clear timer on component unmount
  useEffect(() => {
    return () => {
      if (buttonTimerRef.current) {
        clearTimeout(buttonTimerRef.current);
      }
    };
  }, []);

  const clearButtonTimer = useCallback(() => {
    if (buttonTimerRef.current) {
      clearTimeout(buttonTimerRef.current);
      buttonTimerRef.current = null;
    }
  }, []);

  const setButtonTimeout = useCallback((onTimeout?: () => void) => {
    // Clear existing timer if any
    clearButtonTimer();
    
    // Store timeout callback
    onTimeoutRef.current = onTimeout || null;
    
    // Get configured display time from admin settings
    const displayTime = getBarcodeDisplayTime();
    const timeoutMs = displayTime * 1000;
    
    console.log(`⏰ Setting button timeout for ${displayTime} seconds`);
    
    // Set new timer with configured display time
    buttonTimerRef.current = setTimeout(() => {
      setButtonEnabled(false);
      console.log(`Tombol "Lanjut" dinonaktifkan setelah ${displayTime} detik`);
      
      // Call timeout callback if provided
      if (onTimeoutRef.current) {
        onTimeoutRef.current();
      }
    }, timeoutMs);
  }, [clearButtonTimer, getBarcodeDisplayTime]);

  const cancelCountdown = useCallback(() => {
    console.log('⏹️ Countdown dibatalkan oleh user');
    clearButtonTimer();
    setButtonEnabled(false);
    onTimeoutRef.current = null;
  }, [clearButtonTimer]);

  const handleButtonPress = useCallback(() => {
    clearButtonTimer();
    setButtonEnabled(false);
    console.log('🔘 Tombol "Lanjut" ditekan - timer dibatalkan');
  }, [clearButtonTimer]);

  return {
    buttonEnabled,
    setButtonEnabled,
    setButtonTimeout,
    cancelCountdown,
    handleButtonPress,
    clearButtonTimer
  };
};
