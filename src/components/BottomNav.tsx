'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ReceiptText, 
  Camera, 
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
    { label: 'Scan AI', href: '/ai-input', icon: Camera, isHighlight: true },
    { label: 'Analitik', href: '/analitik', icon: PieChart },
    { label: 'Pengaturan', href: '/pengaturan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#fbfbfa]/95 dark:bg-[#141720]/95 backdrop-blur-lg border-t border-slate-200 dark:border-[#232a3b] safe-area-pb transition-colors">
      <div className="max-w-md md:max-w-xl mx-auto px-3 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3 flex flex-col items-center group min-w-[56px] min-h-[44px] justify-center"
                aria-label="Scan & Input Transaksi"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm flex items-center justify-center transition-all active:scale-95 border border-teal-500/40">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] py-1 px-2 rounded-xl transition-colors ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 dark:bg-teal-400 rounded-full" />
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