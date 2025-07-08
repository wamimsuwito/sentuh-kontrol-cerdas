
import { useState, useCallback, useEffect } from 'react';
import { RelayStatus } from '@/types/relay';
import { updateRelayStatus, parseLimitSwitchMessage, parseRelayStatusMessage } from '@/utils/relayUtils';
import { useScreenControl } from './useScreenControl';
import { useToast } from '@/hooks/use-toast';
import { useAudioManager } from './useAudioManager';

interface UseNotificationHandlerProps {
  setButtonEnabled: (enabled: boolean) => void;
  setButtonTimeout: (onTimeout?: () => void) => void;
}

export const useNotificationHandler = ({ setButtonEnabled, setButtonTimeout }: UseNotificationHandlerProps) => {
  const [relayStatus, setRelayStatus] = useState<RelayStatus>({});
  const [limitSwitchPressed, setLimitSwitchPressed] = useState(false);
  const { wakeScreen, keepScreenOn } = useScreenControl();
  const { toast } = useToast();
  const { playAudio, stopAudio, initializeAudio } = useAudioManager();

  // Initialize audio when component mounts
  useEffect(() => {
    console.log('🔊 Initializing audio manager...');
    initializeAudio();
  }, [initializeAudio]);

  const handleNotification = useCallback((text: string) => {
    console.log('📱 Pesan diterima dari ESP32:', text);
    
    // Handle wake screen command from ESP32
    if (text.includes('WAKE_SCREEN') || text.includes('CUSTOMER_DETECTED')) {
      console.log('🔆 Perintah wake screen diterima dari ESP32');
      
      // Play customer detected audio
      console.log('🔊 Playing customer detected audio');
      playAudio('customer-detected');
      
      wakeScreen().then((success) => {
        if (success) {
          console.log('✅ Layar berhasil dihidupkan');
          toast({
            title: "Selamat Datang!",
            description: "Sensor mendeteksi kedatangan pelanggan. Layar akan tetap hidup selama 5 menit.",
          });
          
          // Keep screen on untuk 300 detik (5 menit)
          keepScreenOn(300000);
        }
      });
    }
    
    if (parseLimitSwitchMessage(text)) {
      console.log('🔘 Limit switch pressed detected');
      
      // Play limit switch audio in loop
      console.log('🔊 Playing limit switch audio (looping)');
      playAudio('limit-switch-active', true);
      
      setLimitSwitchPressed(true);
      setButtonEnabled(true);
      
      // Set timer with timeout callback that stops limit switch audio
      setButtonTimeout(() => {
        console.log('⏰ Button timeout - stopping limit switch audio');
        stopAudio('limit-switch-active');
      });
      
      // Auto-stop limit switch audio after 5 seconds
      setTimeout(() => {
        console.log('⏰ Auto-stopping limit switch audio after 5 seconds');
        stopAudio('limit-switch-active');
      }, 5000);
      
      // Reset limit switch visual indicator after 1 second
      setTimeout(() => setLimitSwitchPressed(false), 1000);
    }
    
    // Handle relay status updates
    const relayStatusUpdate = parseRelayStatusMessage(text);
    if (relayStatusUpdate) {
      console.log('⚡ Relay status update:', relayStatusUpdate);
      setRelayStatus(prev => updateRelayStatus(prev, relayStatusUpdate.relayNumber, relayStatusUpdate.isActive));
    }
    
    // Handle system messages
    if (text.includes('ESP32_CONNECTED') || text.includes('ESP32_READY')) {
      console.log('✅ ESP32 sistem siap');
    }
  }, [setButtonEnabled, setButtonTimeout, wakeScreen, keepScreenOn, toast, playAudio, stopAudio]);

  const handleDisconnect = useCallback(() => {
    console.log('💔 Handling disconnect...');
    // Stop all audio when disconnected
    stopAudio('customer-detected');
    stopAudio('limit-switch-active'); 
    stopAudio('processing-active');
    setRelayStatus({});
    setLimitSwitchPressed(false);
  }, [stopAudio]);

  return {
    relayStatus,
    limitSwitchPressed,
    handleNotification,
    handleDisconnect,
    setRelayStatus,
    setLimitSwitchPressed,
    stopAudio // Export stopAudio for use in other components
  };
};
