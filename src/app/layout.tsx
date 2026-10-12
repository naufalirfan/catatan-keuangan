import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { FinanceProvider } from '@/context/FinanceContext';
import AuthGate from '@/components/AuthGate';

export const metadata: Metadata = {
  title: 'KashFolio: Money & Expense Tracker   by Naufal',
  description: 'Aplikasi pencatatan keuangan modern mobile-first dengan AI cerdas, multi-rekening tanpa batas, anggaran per kategori, target tabungan, dan catatan hutang.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/flying-money.png', type: 'image/png' }
    ],
    shortcut: '/flying-money.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KashFolio',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className="h-full antialiased font-sans">
      <head>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = saved === 'dark' || (saved !== 'light' && prefersDark);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#0c0e12] text-slate-900 dark:text-[#f8fafc] font-sans transition-colors duration-200">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <FinanceProvider>
          <AuthGate>
            {children}
          </AuthGate>
        </FinanceProvider>
      </body>
    </html>
  );
}
