
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cc51a7d5960846ed89c2dbfd261fdce9',
  appName: 'sentuh-kontrol-cerdas',
  webDir: 'dist',
  server: {
    url: 'https://cc51a7d5-9608-46ed-89c2-dbfd261fdce9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: "Memindai perangkat Bluetooth...",
        cancel: "Batal",
        availableDevices: "Perangkat yang tersedia",
        noDeviceFound: "Tidak ada perangkat ditemukan"
      }
    }
  }
};

export default config;
