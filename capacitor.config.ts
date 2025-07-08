
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.relay_orchestra_android_control',
  appName: 'relay-orchestra-android-control',
  webDir: 'dist',
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: "Memindai perangkat BLE...",
        cancel: "Batal",
        availableDevices: "Perangkat tersedia",
        noDeviceFound: "Tidak ada perangkat BLE ditemukan"
      }
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  server: {
    cleartext: true
  }
};

export default config;
