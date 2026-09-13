'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [appDeepLink, setAppDeepLink] = useState('');

  useEffect(() => {
    async function handleAuth() {
      try {
        const code = searchParams.get('code');
        const deepLinkUrl = `com.naufal.catatankeuangan://auth/callback${window.location.search}${window.location.hash}`;
        setAppDeepLink(deepLinkUrl);

        if (code && isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code:', error);
          } else if (data?.session) {
            const tokenDeepLink = `com.naufal.catatankeuangan://auth/callback#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;
            setAppDeepLink(tokenDeepLink);
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile) {
              window.location.href = tokenDeepLink;
            }
            setStatus('success');
            return;
          }
        }

        // Try to trigger Deep Link back to Android APK if opened in mobile Chrome
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = deepLinkUrl;
        }

        setStatus('success');

        // If on web or desktop, redirect to home in 1.5s
        const timer = setTimeout(() => {
          router.replace('/');
        }, 1800);

        return () => clearTimeout(timer);
      } catch (err: unknown) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan otentikasi');
      }
    }

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-5">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 mx-auto">
          {status === 'loading' ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
          ) : (
            <span className="text-2xl">⚠️</span>
          )}
        </div>

        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">
            {status === 'loading'
              ? 'Menghubungkan Akun...'
              : status === 'success'
              ? 'Login Berhasil!'
              : 'Gagal Menghubungkan'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {status === 'loading'
              ? 'Mohon tunggu, sedang memverifikasi sesi login Google Anda.'
              : status === 'success'
              ? 'Mengalihkan Anda kembali ke KashFolio...'
              : errorMessage || 'Silakan coba login kembali di aplikasi.'}
          </p>
        </div>

        {status === 'success' && appDeepLink && (
          <div className="pt-2 space-y-2">
            <a
              href={appDeepLink}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <span>Buka Aplikasi KashFolio</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-[10px] text-slate-400">
              Jika aplikasi tidak terbuka otomatis, klik tombol di atas.
            </p>
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => router.replace('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Kembali ke Beranda
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
