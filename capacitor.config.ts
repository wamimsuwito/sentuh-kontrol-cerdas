
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cc51a7d5960846ed89c2dbfd261fdce9',
  appName: 'NiceNingrum-SentuhKontrolCerdas',
  webDir: 'dist',
  // Comment out server configuration for production build
  // server: {
  //   url: 'https://cc51a7d5-9608-46ed-89c2-dbfd261fdce9.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: "Mencari perangkat Bluetooth...",
        cancel: "Batal",
        availableDevices: "Perangkat tersedia",
        noDeviceFound: "Tidak ada perangkat Bluetooth ditemukan"
      }
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: true,
      spinnerColor: "#3b82f6"
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      keystorePassword: undefined,
      releaseType: 'APK',
      signingType: 'apksigner'
    },
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false // Set to false for production
  }
};

export default config;
