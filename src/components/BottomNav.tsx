'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ReceiptText, 
  Plus, 
  PieChart, 
  Settings 
} from 'lucide-react';

interface BottomNavProps {
  onOpenManualModal?: () => void;
}

export default function BottomNav({ onOpenManualModal }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Transaksi', href: '/transaksi', icon: ReceiptText },
    { label: 'Input', href: '/ai-input', icon: Plus, isHighlight: true },
    { label: 'Analitik', href: '/analitik', icon: PieChart },
    { label: 'Pengaturan', href: '/pengaturan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0a0e17]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 safe-area-pb transition-colors">
      <div className="max-w-md md:max-w-xl mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4 flex flex-col items-center group"
                aria-label="Catat Transaksi Baru"
              >
                <div className="w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/35 flex items-center justify-center transition-all active:scale-90 border-2 border-white dark:border-[#0a0e17]">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Catat
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}