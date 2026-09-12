'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ReceiptText, 
  Sparkles, 
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
    { label: 'Input AI', href: '/ai-input', icon: Sparkles, isHighlight: true },
    { label: 'Analitik', href: '/analitik', icon: PieChart },
    { label: 'Pengaturan', href: '/pengaturan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 safe-area-pb transition-colors">
      <div className="max-w-md md:max-w-xl mx-auto px-3 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4 flex flex-col items-center group"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-1 shadow-lg shadow-emerald-500/30 group-hover:scale-105 group-active:scale-95 transition-all">
                  <div className="w-full h-full bg-slate-900 rounded-[12px] flex items-center justify-center text-white">
                    <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  AI Input
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
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
