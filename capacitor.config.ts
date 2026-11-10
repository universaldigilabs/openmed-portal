import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.antigravity.medicalportal',
  appName: 'Med Vantage',
  webDir: 'out',
  server: {
    // Live Vercel Production App
    url: 'https://openmed-portal.vercel.app',
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
