import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { FinanceProvider } from '@/context/FinanceContext';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import AuthGate from '@/components/AuthGate';
import PlanModal from '@/components/PlanModal';

export const metadata: Metadata = {
  title: 'DompetKu AI • Pencatat Keuangan Pintar by Naufal',
  description: 'Aplikasi pencatatan keuangan mobile-friendly dengan input otomatis Gemini AI, multi-dompet, dan visualisasi pengeluaran.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DompetKu AI',
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
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
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
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <FinanceProvider>
          <AuthGate>
            <Navbar />
            <main className="flex-1 pb-24">
              {children}
            </main>
            <BottomNav />
            <PlanModal />
          </AuthGate>
        </FinanceProvider>
      </body>
    </html>
  );
}
