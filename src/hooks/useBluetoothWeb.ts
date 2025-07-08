
import { useCallback, useRef } from 'react';
import { BLUETOOTH_CONFIG } from '@/constants/bluetooth';

export const useBluetoothWeb = () => {
  const webDeviceRef = useRef<BluetoothDevice | null>(null);
  const webCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

  const connectWeb = useCallback(async (onNotification: (text: string) => void, onDisconnect: () => void) => {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API tidak didukung di browser ini');
      }

      console.log('🌐 Mencari perangkat Bluetooth ESP32...');
      
      let device;
      try {
        // Coba dengan filter nama dan services
        device = await navigator.bluetooth.requestDevice({
          filters: [
            { 
              name: BLUETOOTH_CONFIG.DEVICE_NAME,
              services: [BLUETOOTH_CONFIG.SERVICE_UUID]
            }
          ],
          optionalServices: [BLUETOOTH_CONFIG.SERVICE_UUID]
        });
        console.log('✅ Device ditemukan dengan filter nama dan services');
      } catch (filterError) {
        console.log('⚠️ Filter dengan services gagal, mencoba dengan nama saja:', filterError);
        
        try {
          device = await navigator.bluetooth.requestDevice({
            filters: [
              { name: BLUETOOTH_CONFIG.DEVICE_NAME },
              { namePrefix: BLUETOOTH_CONFIG.DEVICE_NAME_PREFIX }
            ],
            optionalServices: [BLUETOOTH_CONFIG.SERVICE_UUID]
          });
          console.log('✅ Device ditemukan dengan filter nama');
        } catch (nameError) {
          console.log('⚠️ Filter nama gagal, mencoba acceptAllDevices:', nameError);
          
          // Fallback: accept all devices
          device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [BLUETOOTH_CONFIG.SERVICE_UUID]
          });
          console.log('✅ Device ditemukan dengan acceptAllDevices');
        }
      }

      console.log('🎉 Perangkat Web BLE ditemukan:', {
        id: device.id,
        name: device.name || 'Unknown'
      });
      
      console.log('🔗 Menghubungkan ke GATT Server...');
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Gagal terhubung ke GATT server');
      }

      console.log('🔍 Mendapatkan service...');
      const service = await server.getPrimaryService(BLUETOOTH_CONFIG.SERVICE_UUID);
      
      console.log('📡 Mendapatkan TX characteristic untuk notifikasi...');
      const characteristic = await service.getCharacteristic(BLUETOOTH_CONFIG.CHARACTERISTIC_UUID_TX);
      
      webDeviceRef.current = device;
      webCharacteristicRef.current = characteristic;

      console.log('🔔 Memulai notifikasi...');
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (value) {
          const text = new TextDecoder().decode(value);
          console.log('📥 Data diterima dari ESP32 via Web BLE:', text);
          onNotification(text);
        }
      });

      device.addEventListener('gattserverdisconnected', () => {
        console.log('💔 ESP32 terputus dari Web BLE');
        webDeviceRef.current = null;
        webCharacteristicRef.current = null;
        onDisconnect();
      });

      console.log('🎉 Berhasil terhubung ke ESP32 via Web BLE!');
      return true;
    } catch (error) {
      console.error('❌ Gagal terhubung ke ESP32 via Web BLE:', error);
      throw error;
    }
  }, []);

  const sendCommandWeb = useCallback(async (command: string) => {
    if (!webDeviceRef.current || !webDeviceRef.current.gatt?.connected) {
      console.error('❌ Web BLE tidak terhubung');
      throw new Error('Web BLE tidak terhubung');
    }

    try {
      console.log('📤 Mengirim perintah via Web BLE:', command);
      
      // Get RX characteristic for sending commands
      const server = webDeviceRef.current.gatt;
      const service = await server.getPrimaryService(BLUETOOTH_CONFIG.SERVICE_UUID);
      const rxCharacteristic = await service.getCharacteristic(BLUETOOTH_CONFIG.CHARACTERISTIC_UUID_RX);
      
      const encoder = new TextEncoder();
      const data = encoder.encode(command);
      await rxCharacteristic.writeValue(data);
      console.log('✅ Perintah berhasil dikirim via Web BLE:', command);
    } catch (error) {
      console.error('❌ Error mengirim perintah via Web BLE:', error);
      throw error;
    }
  }, []);

  const disconnectWeb = useCallback(async () => {
    try {
      if (webDeviceRef.current && webDeviceRef.current.gatt?.connected) {
        console.log('🔌 Memutus koneksi Web BLE...');
        await webDeviceRef.current.gatt.disconnect();
        console.log('✅ Koneksi Web BLE berhasil diputus');
      }
      webDeviceRef.current = null;
      webCharacteristicRef.current = null;
    } catch (error) {
      console.error('❌ Error disconnecting web BLE:', error);
      webDeviceRef.current = null;
      webCharacteristicRef.current = null;
    }
  }, []);

  return {
    connectWeb,
    sendCommandWeb,
    disconnectWeb,
    webDeviceRef,
    webCharacteristicRef
  };
};
