import { useCallback, useRef } from 'react';
import { BleClient, numbersToDataView, dataViewToNumbers, ScanMode } from '@capacitor-community/bluetooth-le';
import { BLUETOOTH_CONFIG } from '@/constants/bluetooth';

export const useBluetoothNative = () => {
  const deviceIdRef = useRef<string | null>(null);

  const connectNative = useCallback(async (onNotification: (text: string) => void) => {
    try {
      console.log('=== 🚀 MEMULAI PROSES BLE NATIVE ===');
      console.log('📋 Platform info:', {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      });
      
      // Inisialisasi BLE Client dengan pengaturan yang lebih kompatibel
      console.log('📡 Menginisialisasi BLE Client...');
      try {
        await BleClient.initialize();
        console.log('✅ BLE Client berhasil diinisialisasi (tanpa androidNeverForLocation)');
      } catch (initError) {
        console.log('⚠️ Init gagal tanpa options, mencoba dengan androidNeverForLocation:', initError);
        await BleClient.initialize({ 
          androidNeverForLocation: true 
        });
        console.log('✅ BLE Client berhasil diinisialisasi (dengan androidNeverForLocation)');
      }

      // Check if BLE is available
      console.log('🔍 Mengecek ketersediaan BLE...');
      try {
        const isEnabled = await BleClient.isEnabled();
        console.log('📡 BLE Status:', isEnabled ? 'ENABLED' : 'DISABLED');
        if (!isEnabled) {
          console.log('⚠️ BLE tidak aktif, mencoba mengaktifkan...');
          await BleClient.enable();
          console.log('✅ BLE berhasil diaktifkan');
        }
      } catch (enableError) {
        console.log('⚠️ Tidak bisa mengecek/mengaktifkan BLE:', enableError);
      }

      // Scanning device dengan pendekatan yang robust
      console.log('🔍 Memulai scanning BLE...');
      console.log('🎯 Mencari device dengan nama:', BLUETOOTH_CONFIG.DEVICE_NAME);
      console.log('🔗 Service UUID target:', BLUETOOTH_CONFIG.SERVICE_UUID);
      console.log('🔗 DEVICE_NAME_PREFIX:', BLUETOOTH_CONFIG.DEVICE_NAME_PREFIX);
      
      let device;
      
      // Method 1: Scan terbuka dulu untuk melihat semua device
      console.log('🎯 Method 1: Mencoba scan terbuka untuk melihat semua device...');
      try {
        device = await BleClient.requestDevice({
          optionalServices: [BLUETOOTH_CONFIG.SERVICE_UUID],
          scanMode: ScanMode.SCAN_MODE_LOW_LATENCY
        });
        console.log('✅ Device dipilih dari scan terbuka:', {
          deviceId: device.deviceId,
          name: device.name || 'Unknown',
          uuids: device.uuids || []
        });
      } catch (openScanError) {
        console.log('❌ Scan terbuka gagal:', openScanError);
        
        // Method 2: Coba dengan namePrefix
        console.log('🎯 Method 2: Mencoba dengan namePrefix...');
        try {
          device = await BleClient.requestDevice({
            namePrefix: BLUETOOTH_CONFIG.DEVICE_NAME_PREFIX,
            optionalServices: [BLUETOOTH_CONFIG.SERVICE_UUID],
            scanMode: ScanMode.SCAN_MODE_LOW_LATENCY
          });
          console.log('✅ Device ditemukan dengan namePrefix');
        } catch (prefixError) {
          console.log('❌ NamePrefix gagal:', prefixError);
          
          // Method 3: Coba dengan services saja
          console.log('🎯 Method 3: Mencoba dengan services saja...');
          try {
            device = await BleClient.requestDevice({
              services: [BLUETOOTH_CONFIG.SERVICE_UUID],
              scanMode: ScanMode.SCAN_MODE_LOW_LATENCY
            });
            console.log('✅ Device ditemukan dengan services filter');
          } catch (serviceError) {
            console.log('❌ Services filter gagal:', serviceError);
            throw new Error('Semua metode scanning gagal. Pastikan ESP32 menyala dan BLE aktif.');
          }
        }
      }

      console.log('🎉 Perangkat ditemukan:', {
        deviceId: device.deviceId,
        name: device.name || 'Unknown',
        uuids: device.uuids || []
      });
      
      deviceIdRef.current = device.deviceId;

      // Koneksi ke perangkat
      console.log('🔗 Menghubungkan ke perangkat...');
      await BleClient.connect(device.deviceId, (deviceId) => {
        console.log('💔 Perangkat terputus:', deviceId);
        deviceIdRef.current = null;
      });
      console.log('✅ Berhasil terhubung ke perangkat');

      // Cek services yang tersedia
      console.log('🔍 Mengecek services yang tersedia...');
      try {
        const services = await BleClient.getServices(device.deviceId);
        console.log('📋 Services ditemukan:', services.map(s => s.uuid));
        
        const targetService = services.find(s => s.uuid.toLowerCase() === BLUETOOTH_CONFIG.SERVICE_UUID.toLowerCase());
        if (targetService) {
          console.log('✅ Target service ditemukan:', targetService.uuid);
          console.log('📋 Characteristics:', targetService.characteristics?.map(c => c.uuid));
        } else {
          console.log('⚠️ Target service tidak ditemukan dalam daftar services');
        }
      } catch (servicesError) {
        console.log('⚠️ Tidak bisa mendapatkan daftar services:', servicesError);
      }

      // Mulai notifikasi
      console.log('📡 Memulai notifikasi...');
      await BleClient.startNotifications(
        device.deviceId,
        BLUETOOTH_CONFIG.SERVICE_UUID,
        BLUETOOTH_CONFIG.CHARACTERISTIC_UUID_TX,
        (value) => {
          try {
            const data = dataViewToNumbers(value);
            const text = new TextDecoder().decode(new Uint8Array(data));
            console.log('📥 Data diterima dari ESP32:', text);
            onNotification(text);
          } catch (error) {
            console.error('❌ Error memproses notifikasi:', error);
          }
        }
      );
      console.log('✅ Notifikasi berhasil dimulai');

      // Test koneksi dengan PING
      console.log('🏓 Mengirim perintah PING untuk test koneksi...');
      const testCommand = 'PING';
      const encoder = new TextEncoder();
      const testData = encoder.encode(testCommand);
      const testDataView = numbersToDataView(Array.from(testData));
      
      await BleClient.write(
        device.deviceId,
        BLUETOOTH_CONFIG.SERVICE_UUID,
        BLUETOOTH_CONFIG.CHARACTERISTIC_UUID_RX,
        testDataView
      );
      console.log('✅ Perintah PING berhasil dikirim');

      console.log('🎉 KONEKSI BLE NATIVE BERHASIL SEMPURNA!');
      return true;
      
    } catch (error) {
      console.error('❌ ERROR PADA NATIVE BLE:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      
      // Log informasi debugging tambahan
      try {
        const isEnabled = await BleClient.isEnabled();
        console.log('🔍 BLE Status saat error:', isEnabled ? 'ENABLED' : 'DISABLED');
      } catch (statusError) {
        console.log('❌ Tidak bisa mengecek BLE status:', statusError);
      }
      
      // Reset device reference jika ada error
      if (deviceIdRef.current) {
        try {
          await BleClient.disconnect(deviceIdRef.current);
        } catch (disconnectError) {
          console.error('❌ Error saat disconnect setelah error:', disconnectError);
        }
        deviceIdRef.current = null;
      }
      
      throw error;
    }
  }, []);

  const sendCommandNative = useCallback(async (command: string) => {
    if (!deviceIdRef.current) {
      console.error('❌ Tidak ada device yang terhubung');
      throw new Error('Device tidak terhubung');
    }

    try {
      console.log('📤 Mengirim perintah:', command);
      
      const encoder = new TextEncoder();
      const data = encoder.encode(command);
      const dataView = numbersToDataView(Array.from(data));
      
      await BleClient.write(
        deviceIdRef.current,
        BLUETOOTH_CONFIG.SERVICE_UUID,
        BLUETOOTH_CONFIG.CHARACTERISTIC_UUID_RX,
        dataView
      );
      
      console.log('✅ Perintah berhasil dikirim:', command);
    } catch (error) {
      console.error('❌ Error mengirim perintah:', error);
      throw error;
    }
  }, []);

  const disconnectNative = useCallback(async () => {
    try {
      if (deviceIdRef.current) {
        console.log('🔌 Memutus koneksi Native BLE...');
        await BleClient.disconnect(deviceIdRef.current);
        console.log('✅ Koneksi Native BLE berhasil diputus');
        deviceIdRef.current = null;
      }
    } catch (error) {
      console.error('❌ Error saat disconnect native:', error);
      deviceIdRef.current = null; // Reset even if disconnect fails
    }
  }, []);

  return {
    connectNative,
    sendCommandNative,
    disconnectNative,
    deviceIdRef
  };
};
