import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.naufal.catatankeuangan',
  appName: 'KashFolio',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Redirect API calls to the live Vercel deployment
    // so server-side routes (AI, parse, etc.) still work in the APK
    url: 'https://catatan-keuangan-nfl.vercel.app',
    allowNavigation: ['catatan-keuangan-nfl.vercel.app'],
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0f172a',
    appendUserAgent: 'KashFolioApp',
  },
};

export default config;
