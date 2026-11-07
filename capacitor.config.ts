import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.antigravity.medicalportal',
  appName: 'Medical Portal',
  webDir: 'out',
  server: {
    // During local mobile testing, you can uncomment this to point to your live local dev server:
    // url: 'http://192.168.1.X:3000',
    // cleartext: true
    androidScheme: 'https'
  }
};

export default config;
