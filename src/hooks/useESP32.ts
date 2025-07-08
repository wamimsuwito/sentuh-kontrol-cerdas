
import { useState, useCallback, useRef } from 'react';
import { RelayStatus } from '@/types/relay';

export const useESP32 = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [relayStatus, setRelayStatus] = useState<RelayStatus>({});
  const [limitSwitchPressed, setLimitSwitchPressed] = useState(false);
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const connectToESP32 = useCallback(async () => {
    try {
      if ('serial' in navigator) {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        
        portRef.current = port;
        setIsConnected(true);

        // Start reading data
        const reader = port.readable.getReader();
        readerRef.current = reader;

        const readLoop = async () => {
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              
              const text = new TextDecoder().decode(value);
              console.log('Received from ESP32:', text);
              
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
          } catch (error) {
            console.error('Error reading from ESP32:', error);
          }
        };

        readLoop();
      } else {
        throw new Error('Web Serial API not supported');
      }
    } catch (error) {
      console.error('Failed to connect to ESP32:', error);
      alert('Gagal terhubung ke ESP32. Pastikan browser mendukung Web Serial API dan ESP32 terhubung.');
    }
  }, []);

  const sendCommand = useCallback(async (command: string) => {
    if (portRef.current && isConnected) {
      try {
        const writer = portRef.current.writable.getWriter();
        await writer.write(new TextEncoder().encode(command + '\n'));
        writer.releaseLock();
        console.log('Sent to ESP32:', command);
      } catch (error) {
        console.error('Error sending command:', error);
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
    if (readerRef.current) {
      await readerRef.current.cancel();
      readerRef.current = null;
    }
    if (portRef.current) {
      await portRef.current.close();
      portRef.current = null;
    }
    setIsConnected(false);
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
