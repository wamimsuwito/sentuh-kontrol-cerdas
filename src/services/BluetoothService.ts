
import { BleClient, BleDevice, numberToUUID } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

export class BluetoothService {
  private device: BleDevice | null = null;
  private readonly serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
  private readonly characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
  private readonly limitSwitchCharacteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
  private isInitialized = false;
  private isConnecting = false;

  async initialize(): Promise<void> {
    try {
      console.log('Menginisialisasi Bluetooth LE...');
      
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        console.log('Bluetooth hanya tersedia di platform native (Android/iOS)');
        throw new Error('Bluetooth hanya tersedia di platform native');
      }

      await BleClient.initialize();
      this.isInitialized = true;
      console.log('Bluetooth LE berhasil diinisialisasi');
    } catch (error) {
      console.error('Error saat inisialisasi Bluetooth LE:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  async scanAndConnect(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Bluetooth belum diinisialisasi');
    }

    if (this.isConnecting) {
      console.log('Sudah dalam proses koneksi...');
      return;
    }

    try {
      this.isConnecting = true;
      console.log('Memulai scan perangkat ESP32...');
      
      await BleClient.requestLEScan(
        { 
          services: [this.serviceUUID],
          name: 'ESP32_Relay_Controller'
        },
        (result) => {
          console.log('Perangkat ditemukan:', result);
          if (result.device.name?.includes('ESP32') || result.device.name === 'ESP32_Relay_Controller') {
            this.device = result.device;
            BleClient.stopLEScan();
            this.connectToDevice();
          }
        }
      );

      // Stop scan setelah 10 detik jika tidak menemukan perangkat
      setTimeout(() => {
        BleClient.stopLEScan();
        this.isConnecting = false;
        if (!this.device) {
          console.log('Timeout: ESP32 tidak ditemukan dalam 10 detik');
          throw new Error('ESP32 tidak ditemukan');
        }
      }, 10000);
    } catch (error) {
      this.isConnecting = false;
      console.error('Error saat scan perangkat:', error);
      throw error;
    }
  }

  private async connectToDevice(): Promise<void> {
    if (!this.device) {
      this.isConnecting = false;
      return;
    }

    try {
      console.log('Mencoba menghubungkan ke ESP32...');
      await BleClient.connect(this.device.deviceId);
      console.log('Berhasil terhubung ke ESP32');
      
      // Subscribe untuk menerima data dari limit switch
      await BleClient.startNotifications(
        this.device.deviceId,
        this.serviceUUID,
        this.limitSwitchCharacteristicUUID,
        (value) => {
          const decoder = new TextDecoder();
          // Convert DataView to Uint8Array for TextDecoder
          const uint8Array = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
          const message = decoder.decode(uint8Array);
          console.log('Data dari limit switch ESP32:', message);
          
          // Emit event untuk UI
          if (message.includes('PRESSED')) {
            window.dispatchEvent(new CustomEvent('limitSwitchPressed', { 
              detail: { message } 
            }));
          }
        }
      );

      this.isConnecting = false;
      // Emit connected event
      window.dispatchEvent(new CustomEvent('bluetoothConnected'));
    } catch (error) {
      this.isConnecting = false;
      console.error('Error saat menghubungkan ke ESP32:', error);
      throw error;
    }
  }

  async sendRelayCommand(relayNumber: number, action: 'ON' | 'OFF'): Promise<void> {
    if (!this.device) {
      throw new Error('ESP32 tidak terhubung');
    }

    try {
      const command = `RELAY_${relayNumber}_${action}`;
      console.log(`Mengirim perintah ke ESP32: ${command}`);
      
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(command);
      
      // Convert Uint8Array to DataView for BleClient.write
      const dataView = new DataView(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);

      await BleClient.write(
        this.device.deviceId,
        this.serviceUUID,
        this.characteristicUUID,
        dataView
      );

      console.log(`Perintah berhasil dikirim ke ESP32: ${command}`);
    } catch (error) {
      console.error('Error saat mengirim perintah ke ESP32:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      try {
        await BleClient.disconnect(this.device.deviceId);
        this.device = null;
        this.isConnecting = false;
        console.log('ESP32 terputus');
        
        // Emit disconnected event
        window.dispatchEvent(new CustomEvent('bluetoothDisconnected'));
      } catch (error) {
        console.error('Error saat memutus koneksi ESP32:', error);
      }
    }
  }

  isConnected(): boolean {
    return this.device !== null;
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'unavailable' | 'connecting' {
    if (!Capacitor.isNativePlatform()) {
      return 'unavailable';
    }
    if (this.isConnecting) {
      return 'connecting';
    }
    return this.device ? 'connected' : 'disconnected';
  }
}

export const bluetoothService = new BluetoothService();
