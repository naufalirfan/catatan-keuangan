'use client';

import React, { useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { 
  Wallet, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  UserCheck, 
  Bot, 
  Zap, 
  ArrowRight
} from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    googleClientId, 
    loginWithGoogleCredential,
    loginAsDemo,
    loginAsAdmin 
  } = useFinance();

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

            const btnContainer = document.getElementById('google-signin-btn-container');
            if (btnContainer) {
              btnContainer.innerHTML = '';
              googleObj.accounts.id.renderButton(btnContainer, {
                theme: 'filled_black',
                size: 'large',
                width: 320,
                text: 'continue_with',
                shape: 'pill',
              });
            }
          } catch (err) {
            console.error('Failed to initialize Google Identity Services:', err);
          }
        }
      };

      initGsi();
      const timer = setTimeout(initGsi, 1000);
      return () => clearTimeout(timer);
    }
  }, [googleClientId, loginWithGoogleCredential]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 animate-bounce">
            <Wallet className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase animate-pulse">
            Memuat DompetKu AI...
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/25 mb-1">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dompet<span className="text-emerald-500">Ku</span> AI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Pencatatan keuangan modern dengan kecerdasan Gemini AI, multi-dompet & visualisasi analitik real-time.
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

          {/* Real Google GIS Button */}
          <div className="flex justify-center min-h-[44px]">
            <div id="google-signin-btn-container" className="flex justify-center w-full" />
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              atau coba instan
            </span>
          </div>

          {/* Quick Access Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={loginAsAdmin}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              Akun Admin (Naufal)
            </button>

            <button
              onClick={loginAsDemo}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              Mode Demo Tamu
            </button>
          </div>

          <p className="text-[10px] text-slate-400 pt-1">
            Data tersimpan aman di browser Anda dan tersinkron otomatis saat online.
          </p>

        </div>

      </div>
    </div>
  );
}
