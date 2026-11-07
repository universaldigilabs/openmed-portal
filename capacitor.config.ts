import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.antigravity.medicalportal',
  appName: 'OpenMed',
  webDir: 'out',
  server: {
    // POINT TO YOUR LIVE VERCEL APP:
    // Once deployed, set your Vercel URL below so the native mobile container loads your live app.
    // Any change you push to GitHub/Vercel will immediately reflect in the mobile app without app store updates!
    // url: 'https://your-app.vercel.app',
    
    // For local testing on an Android device or emulator on the same Wi-Fi:
    // url: 'http://10.0.2.2:3000', // 10.0.2.2 is localhost for Android Emulator
    
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
