
import { useState, useCallback, useRef } from 'react';
import { RelayStatus } from '@/types/relay';

export const useESP32Bluetooth = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [relayStatus, setRelayStatus] = useState<RelayStatus>({});
  const [limitSwitchPressed, setLimitSwitchPressed] = useState(false);
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

  const connectToESP32 = useCallback(async () => {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API tidak didukung di browser ini');
      }

      console.log('Mencari perangkat Bluetooth ESP32...');
      
      // Filter yang lebih fleksibel untuk BLE
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'ESP32_Relay_Controller' },
          { namePrefix: 'ESP32' }
        ],
        optionalServices: ['12345678-1234-1234-1234-123456789abc']
      });

      console.log('Perangkat ditemukan:', device.name);
      console.log('Menghubungkan ke GATT Server...');
      
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Gagal terhubung ke GATT server');
      }

      console.log('Mendapatkan Service...');
      const service = await server.getPrimaryService('12345678-1234-1234-1234-123456789abc');
      
      console.log('Mendapatkan Characteristic...');
      const characteristic = await service.getCharacteristic('87654321-4321-4321-4321-cba987654321');
      
      deviceRef.current = device;
      characteristicRef.current = characteristic;
      setIsConnected(true);

      // Start notifications
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (value) {
          const text = new TextDecoder().decode(value);
          console.log('Diterima dari ESP32 via BLE:', text);
          
          // Parse messages from ESP32
          if (text.includes('LIMIT_SWITCH_PRESSED')) {
            setLimitSwitchPressed(true);
            setTimeout(() => setLimitSwitchPressed(false), 1000);
          }
          
          if (text.includes('RELAY_STATUS:')) {
            const relayData = text.split('RELAY_STATUS:')[1];
            // Parse relay status if needed
          }
        }
      });

      device.addEventListener('gattserverdisconnected', () => {
        console.log('ESP32 terputus');
        setIsConnected(false);
        deviceRef.current = null;
        characteristicRef.current = null;
      });

      console.log('Berhasil terhubung ke ESP32 via BLE!');

    } catch (error) {
      console.error('Gagal terhubung ke ESP32:', error);
      throw error;
    }
  }, []);

  const sendCommand = useCallback(async (command: string) => {
    if (characteristicRef.current && isConnected) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(command);
        await characteristicRef.current.writeValue(data);
        console.log('Dikirim ke ESP32 via BLE:', command);
      } catch (error) {
        console.error('Error mengirim perintah via BLE:', error);
      }
    }
  }, [isConnected]);

  const activateRelay = useCallback((relayNumber: number) => {
    sendCommand(`RELAY_ON:${relayNumber}`);
    setRelayStatus(prev => ({ ...prev, [relayNumber]: true }));
  }, [sendCommand]);

  const deactivateRelay = useCallback((relayNumber: number) => {
    sendCommand(`RELAY_OFF:${relayNumber}`);
    setRelayStatus(prev => ({ ...prev, [relayNumber]: false }));
  }, [sendCommand]);

  const disconnect = useCallback(async () => {
    if (deviceRef.current && deviceRef.current.gatt?.connected) {
      await deviceRef.current.gatt.disconnect();
    }
    setIsConnected(false);
    deviceRef.current = null;
    characteristicRef.current = null;
  }, []);

  return {
    isConnected,
    relayStatus,
    limitSwitchPressed,
    connectToESP32,
    activateRelay,
    deactivateRelay,
    disconnect,
    sendCommand
  };
};
