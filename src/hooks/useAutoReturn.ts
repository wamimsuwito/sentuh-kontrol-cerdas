
import { useEffect, useRef, useCallback } from 'react';

interface UseAutoReturnProps {
  onReturn: () => void;
  timeout?: number; // in milliseconds
}

export const useAutoReturn = ({ onReturn, timeout = 15000 }: UseAutoReturnProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      console.log('Auto-return: Kembali ke halaman awal setelah 15 detik tidak ada aktivitas');
      onReturn();
    }, timeout);
  }, [onReturn, timeout]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Set up event listeners for user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Start timer immediately
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      clearTimer();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetTimer, clearTimer]);

  return { resetTimer, clearTimer };
};
