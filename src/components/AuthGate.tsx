'use client';

import React, { useEffect, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Capacitor } from '@capacitor/core';
import { 
  Wallet, 
  Sparkles, 
  ShieldCheck, 
  Bot, 
  Zap, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    googleClientId, 
    signInWithGoogle,
    loginWithGoogleCredential,
    loginAsDemo
  } = useFinance();

  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const native = Capacitor.isNativePlatform() || (typeof navigator !== 'undefined' && navigator.userAgent.includes('KashFolioApp'));
    setIsNative(native);
  }, []);


  // Initialize Google Identity Services if client id is present
  useEffect(() => {
    if (typeof window !== 'undefined' && googleClientId) {
      const initGsi = () => {
        interface GoogleAccountsId {
          initialize: (config: { client_id: string; callback: (res: { credential?: string }) => void }) => void;
          renderButton: (container: HTMLElement, options: Record<string, string | number>) => void;
        }
        const googleObj = (window as unknown as { google?: { accounts: { id: GoogleAccountsId } } }).google;
        if (googleObj?.accounts?.id) {
          try {
            googleObj.accounts.id.initialize({
              client_id: googleClientId,
              callback: (response: { credential?: string }) => {
                if (response.credential) {
                  loginWithGoogleCredential(response.credential);
                }
              },
            });

            const btnContainer = document.getElementById('google-real-button-container');
            if (btnContainer) {
              btnContainer.innerHTML = '';
              googleObj.accounts.id.renderButton(btnContainer, {
                theme: 'outline',
                size: 'large',
                width: 320,
                text: 'continue_with',
                shape: 'rectangular',
              });
            }
          } catch (err) {
            console.error('Failed to initialize Google Identity Services:', err);
          }
        }
      };

      initGsi();
      const t1 = setTimeout(initGsi, 500);
      const t2 = setTimeout(initGsi, 1500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [googleClientId, loginWithGoogleCredential]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 animate-bounce p-2.5">
            <img src="/flying-money.png" alt="KashFolio" className="w-full h-full object-contain drop-shadow" />
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase animate-pulse">
            Memuat KashFolio...
          </p>
        </div>
      </div>
    );
  }

  // If logged in, render child pages
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If unauthenticated, show Auth Landing
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/25 mb-1 p-3">
            <img src="/flying-money.png" alt="KashFolio" className="w-full h-full object-contain drop-shadow" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Kash<span className="text-emerald-500">Folio</span>
          </h1>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Money & Expense Tracker
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Pencatatan keuangan modern dengan kecerdasan Gemini AI, multi-rekening & visualisasi analitik real-time.
          </p>
        </div>

        {/* Feature Highlights Card */}
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Input Cerdas Natural Language AI
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cukup ketik kalimat santai atau foto struk, AI mendeteksi nominal dan kategori secara otomatis.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Custom Endpoint & Token Fleksibel
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gunakan API Key Gemini gratis atau hubungkan ke endpoint kustom pilihan Anda.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Data Aman & Sinkron Multi-Perangkat
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dukungan Supabase Cloud dan cache lokal berkecepatan tinggi yang dapat diakses offline.
              </p>
            </div>
          </div>
        </div>

        {/* Login Options Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-center">
          
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Masuk dengan Akun Anda
          </h2>

          {/* Primary Google Login Section */}
          <div className="space-y-3 py-1">
            {isNative || !googleClientId ? (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-bold text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Akun Google</span>
              </button>
            ) : (
              <div className="w-full flex justify-center py-1 min-h-[44px]">
                <div id="google-real-button-container" className="w-full flex justify-center" />
              </div>
            )}

            {/* Separator / Guest Option */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={loginAsDemo}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Masuk sebagai Tamu (Mode Demo)</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            Data tersimpan aman di cloud & browser Anda, terisolasi 1 akun 1 catatan.
          </p>
        </div>



      </div>
    </div>
  );
}
