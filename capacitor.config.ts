
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shinobi.crimson',
  appName: 'Crimson Shinobi',
  webDir: 'dist',
  // FIX: The 'bundledWebRuntime' property is deprecated and is not a valid key in CapacitorConfig. It has been removed.
  server: {
    androidScheme: 'https'
  }
};

export default config;
