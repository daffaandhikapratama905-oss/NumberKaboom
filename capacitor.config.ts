import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.NumberKaboom.app',
  appName: 'Number Kaboom',
  webDir: 'www',
  plugins: {
    ScreenOrientation: {
      orientation: 'portrait'
    }
  }
};

export default config;
