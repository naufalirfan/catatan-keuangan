import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { FinanceProvider } from '@/context/FinanceContext';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import AuthGate from '@/components/AuthGate';
import PlanModal from '@/components/PlanModal';

export const metadata: Metadata = {
  title: 'KashFolio: Money & Expense Tracker • by Naufal',
  description: 'Aplikasi pencatatan keuangan modern mobile-first dengan AI cerdas, multi-rekening tanpa batas, anggaran per kategori, target tabungan, dan catatan hutang.',
  icons: {
    icon: '/flying-money.png',
    shortcut: '/flying-money.png',
    apple: '/flying-money.png',
  },
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
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
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
