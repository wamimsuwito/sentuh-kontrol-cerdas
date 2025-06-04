
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cc51a7d5960846ed89c2dbfd261fdce9',
  appName: 'sentuh-kontrol-cerdas',
  webDir: 'dist',
  server: {
    url: 'https://cc51a7d5-9608-46ed-89c2-dbfd261fdce9.lovableproject.com?forceHideBadge=true',
    cleartext: true
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
    webContentsDebuggingEnabled: true
  }
};

export default config;
