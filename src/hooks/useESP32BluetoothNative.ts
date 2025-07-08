
import { useCallback } from 'react';
import { createRelayCommands } from '@/utils/relayUtils';
import { useButtonTimer } from './useButtonTimer';
import { useNotificationHandler } from './useNotificationHandler';
import { useConnectionManager } from './useConnectionManager';

export const useESP32BluetoothNative = () => {
  const {
    buttonEnabled,
    setButtonEnabled,
    setButtonTimeout,
    cancelCountdown,
    handleButtonPress,
    clearButtonTimer
  } = useButtonTimer();

  const {
    relayStatus,
    limitSwitchPressed,
    handleNotification,
    handleDisconnect: handleNotificationDisconnect,
    setRelayStatus,
    setLimitSwitchPressed,
    stopAudio
  } = useNotificationHandler({ setButtonEnabled, setButtonTimeout });

  const handleDisconnect = useCallback(() => {
    handleNotificationDisconnect();
    setButtonEnabled(false);
  }, [handleNotificationDisconnect, setButtonEnabled]);

  const {
    isConnected,
    isConnecting,
    isNative,
    connectToESP32,
    sendCommand,
    disconnect
  } = useConnectionManager({ 
    handleNotification, 
    handleDisconnect,
    clearButtonTimer 
  });

  const activateRelay = useCallback((relayNumber: number) => {
    const command = createRelayCommands.activate(relayNumber);
    console.log('⚡ Mengaktifkan relay:', relayNumber, 'dengan perintah:', command);
    sendCommand(command);
  }, [sendCommand]);

  const deactivateRelay = useCallback((relayNumber: number) => {
    const command = createRelayCommands.deactivate(relayNumber);
    console.log('⚡ Menonaktifkan relay:', relayNumber, 'dengan perintah:', command);
    sendCommand(command);
  }, [sendCommand]);

  // Function to manually stop limit switch audio
  const stopLimitSwitchAudio = useCallback(() => {
    console.log('🔇 MANUAL STOP LIMIT SWITCH AUDIO');
    stopAudio('limit-switch-active');
  }, [stopAudio]);

  return {
    isConnected,
    isConnecting,
    relayStatus,
    limitSwitchPressed,
    buttonEnabled,
    connectToESP32,
    activateRelay,
    deactivateRelay,
    disconnect,
    sendCommand,
    handleButtonPress,
    setButtonTimeout,
    cancelCountdown,
    isNative,
    stopLimitSwitchAudio
  };
};
