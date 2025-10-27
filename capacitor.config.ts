import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shinobi.crimson',
  appName: 'Crimson Shinobi',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
