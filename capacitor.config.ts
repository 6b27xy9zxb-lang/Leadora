import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.himanshu.leadora',
  appName: 'Leadora',
  webDir: 'dist',
  server: {
    url: 'https://leadora-mu.vercel.app',
    cleartext: false
  }
};

export default config;