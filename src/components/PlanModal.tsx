'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { 
  Crown, 
  Check, 
  Sparkles, 
  X, 
  Zap, 
  ShieldCheck, 
  Wallet, 
  Infinity as InfinityIcon,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

import confetti from 'canvas-confetti';

export default function PlanModal() {
  const { 
    showPlanModal, 
    setShowPlanModal, 
    userPlan, 
    setUserPlan, 
    isSuperAdmin,
    user 
  } = useFinance();

  if (!showPlanModal) return null;

  const handleSelectPlan = (plan: 'free' | 'pro') => {
    setUserPlan(plan);
    if (plan === 'pro') {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
    setShowPlanModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowPlanModal(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-emerald-500 text-white shadow-lg shadow-amber-500/20 mb-2">
            <Crown className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Pilih Paket Akses Akun
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            1 Akun 1 Catatan Eksklusif untuk {user?.name || 'Anda'}
          </p>

          {isSuperAdmin && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Superadmin Mode: Bebas Pilih & Ubah Kapan Saja
            </div>
          )}
        </div>

        {/* Comparison Cards Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          
          {/* PRO PLAN CARD */}
          <div className={`relative p-5 rounded-3xl border-2 transition-all ${
            userPlan === 'pro'
              ? 'border-emerald-500 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-slate-900 shadow-xl shadow-emerald-500/10'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white shadow-sm">
                  <Crown className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    Mode PRO
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider">
                      Terpopuler
                    </span>
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Akses Tanpa Batas & Fitur AI Penuh
                  </span>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                Aktif
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Unlimited</strong> Catatan Transaksi</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Unlimited</strong> Dompet, Rekening & E-Wallet</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Input AI</strong> & Scan Struk Tanpa Batas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Ekspor Laporan Excel/CSV & Cadangan Cloud</span>
              </li>
            </ul>

            {/* Instagram Contact for Upgrade Info */}
            {!isSuperAdmin && userPlan !== 'pro' && (
              <a
                href="https://www.instagram.com/naufal_irfansyah"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3.5 mb-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-300/60 dark:border-pink-800/60 hover:border-pink-500 transition-all group shadow-sm text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-sm shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-pink-600 transition-colors flex items-center gap-1">
                        Mau Upgrade ke Akun PRO? 🚀
                        <ExternalLink className="w-3 h-3 text-pink-500" />
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Hubungi pengembang: <span className="font-bold text-pink-600 dark:text-pink-400">@naufal_irfansyah</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-pink-500/15 text-pink-700 dark:text-pink-300">
                    Chat IG
                  </span>
                </div>
              </a>
            )}

            {isSuperAdmin ? (
              <button
                onClick={() => handleSelectPlan('pro')}
                className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 ${
                  userPlan === 'pro'
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-emerald-500/25 hover:from-emerald-600 hover:to-cyan-600'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {userPlan === 'pro' ? 'Paket PRO Anda Sedang Aktif' : 'Pilih Mode PRO (Superadmin)'}
              </button>
            ) : userPlan === 'pro' ? (
              <div className="w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow-md shadow-emerald-500/25">
                <Check className="w-4 h-4" />
                Paket PRO Anda Sedang Aktif
              </div>
            ) : (
              <a
                href="https://www.instagram.com/naufal_irfansyah"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-md shadow-pink-500/25 hover:opacity-95 transition-all active:scale-98"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Hubungi @naufal_irfansyah untuk Upgrade PRO</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>


          {/* FREE PLAN CARD */}
          <div className={`p-4 rounded-3xl border transition-all ${
            userPlan === 'free'
              ? 'border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mode FREE (Dasar)
                </h3>
                <span className="text-[10px] text-slate-400">
                  Untuk pencatatan sederhana
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Rp 0
              </span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-slate-400" />
                <span>Maksimal 50 transaksi tercatat</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-slate-400" />
                <span>Maksimal 3 dompet/rekening</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-slate-400" />
                <span>Input manual & AI kuota standar</span>
              </li>
            </ul>

            <button
              onClick={() => handleSelectPlan('free')}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs border transition-colors ${
                userPlan === 'free'
                  ? 'border-slate-400 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {userPlan === 'free' ? 'Sedang Digunakan' : 'Beralih ke Free'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
