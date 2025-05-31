
import { BleClient, BleDevice, numberToUUID } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

export class BluetoothService {
  private device: BleDevice | null = null;
  private readonly serviceUUID = '12345678-1234-1234-1234-123456789abc';
  private readonly characteristicUUID = '87654321-4321-4321-4321-cba987654321';
  private readonly limitSwitchCharacteristicUUID = '87654321-4321-4321-4321-cba987654322';
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
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

    try {
      console.log('Memulai scan perangkat...');
      
      await BleClient.requestLEScan(
        { services: [this.serviceUUID] },
        (result) => {
          console.log('Perangkat ditemukan:', result);
          if (result.device.name === 'ESP32_Relay_Controller') {
            this.device = result.device;
            BleClient.stopLEScan();
            this.connectToDevice();
          }
        }
      );

      // Stop scan setelah 10 detik jika tidak menemukan perangkat
      setTimeout(() => {
        BleClient.stopLEScan();
        if (!this.device) {
          console.log('Timeout: ESP32 tidak ditemukan');
        }
      }, 10000);
    } catch (error) {
      console.error('Error saat scan perangkat:', error);
      throw error;
    }
  }

  private async connectToDevice(): Promise<void> {
    if (!this.device) return;

    try {
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
          console.log('Data dari limit switch:', message);
          
          // Emit event untuk UI
          window.dispatchEvent(new CustomEvent('limitSwitchPressed', { 
            detail: { message } 
          }));
        }
      );

      // Emit connected event
      window.dispatchEvent(new CustomEvent('bluetoothConnected'));
    } catch (error) {
      console.error('Error saat menghubungkan ke perangkat:', error);
      throw error;
    }
  }

  async sendRelayCommand(relayNumber: number, action: 'ON' | 'OFF'): Promise<void> {
    if (!this.device) {
      throw new Error('Perangkat tidak terhubung');
    }

    try {
      const command = `RELAY_${relayNumber}_${action}`;
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

      console.log(`Perintah dikirim: ${command}`);
    } catch (error) {
      console.error('Error saat mengirim perintah:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      try {
        await BleClient.disconnect(this.device.deviceId);
        this.device = null;
        console.log('Perangkat terputus');
        
        // Emit disconnected event
        window.dispatchEvent(new CustomEvent('bluetoothDisconnected'));
      } catch (error) {
        console.error('Error saat memutus koneksi:', error);
      }
    }
  }

  isConnected(): boolean {
    return this.device !== null;
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'unavailable' {
    if (!Capacitor.isNativePlatform()) {
      return 'unavailable';
    }
    return this.device ? 'connected' : 'disconnected';
  }
}

export const bluetoothService = new BluetoothService();
