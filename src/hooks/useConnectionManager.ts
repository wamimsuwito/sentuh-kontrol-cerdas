
import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useBluetoothNative } from './useBluetoothNative';
import { useBluetoothWeb } from './useBluetoothWeb';

interface UseConnectionManagerProps {
  handleNotification: (text: string) => void;
  handleDisconnect: () => void;
  clearButtonTimer: () => void;
}

export const useConnectionManager = ({ handleNotification, handleDisconnect, clearButtonTimer }: UseConnectionManagerProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  const { connectNative, sendCommandNative, disconnectNative } = useBluetoothNative();
  const { connectWeb, sendCommandWeb, disconnectWeb } = useBluetoothWeb();

  const connectToESP32 = useCallback(async () => {
    console.log('🔄 Mencoba koneksi, isNative:', isNative);
    
    setIsConnecting(true);
    
    try {
      if (isNative) {
        console.log('📱 Menggunakan Native BLE (Capacitor)');
        await connectNative(handleNotification);
      } else {
        console.log('🌐 Menggunakan Web BLE');
        await connectWeb(handleNotification, () => {
          handleDisconnect();
          setIsConnected(false);
        });
      }
      
      console.log('✅ Koneksi BLE berhasil!');
      setIsConnected(true);
    } catch (error) {
      console.error('❌ Error saat koneksi BLE:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isNative, connectNative, connectWeb, handleNotification, handleDisconnect]);

  const sendCommand = useCallback(async (command: string) => {
    if (!isConnected) {
      console.log('⚠️ Tidak terhubung, perintah diabaikan:', command);
      return;
    }

    console.log('📤 Mengirim perintah:', command, 'via', isNative ? 'Native' : 'Web');
    
    try {
      if (isNative) {
        await sendCommandNative(command);
      } else {
        await sendCommandWeb(command);
      }
    } catch (error) {
      console.error('❌ Error mengirim perintah:', error);
    }
  }, [isConnected, isNative, sendCommandNative, sendCommandWeb]);

  const disconnect = useCallback(async () => {
    console.log('🔌 Memutus koneksi...');
    
    try {
      if (isNative) {
        await disconnectNative();
      } else {
        await disconnectWeb();
      }
    } catch (error) {
      console.error('❌ Error saat disconnect:', error);
    }
    
    setIsConnected(false);
    handleDisconnect();
    
    // Clear timer on disconnect
    clearButtonTimer();
  }, [isNative, disconnectNative, disconnectWeb, handleDisconnect, clearButtonTimer]);

  return {
    isConnected,
    isConnecting,
    isNative,
    connectToESP32,
    sendCommand,
    disconnect
  };
};
