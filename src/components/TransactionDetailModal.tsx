'use client';

import React from 'react';
import { Transaction } from '@/types/finance';
import { useFinance } from '@/context/FinanceContext';
import CategoryIcon from './CategoryIcon';
import { 
  ArrowLeft, 
  Trash2, 
  Calendar, 
  Clock, 
  Wallet, 
  GitFork, 
  Tag, 
  FileText,
  CreditCard
} from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  const { deleteTransaction } = useFinance();

  if (!isOpen || !transaction) return null;

  const isSplit = Array.isArray(transaction.splits) && transaction.splits.length > 0;

  // Format date to Indonesian like: Sabtu, 4 Juli 2026
  const formattedDate = (() => {
    try {
      const parts = transaction.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d);
      }
      return transaction.date;
    } catch {
      return transaction.date;
    }
  })();

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      deleteTransaction(transaction.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#FAFAFA] dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Top App Bar with Back Button */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Detail Transaksi
          </h2>
          <button
            onClick={handleDelete}
            title="Hapus Transaksi"
            className="p-2 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Main Visual Header: Icon + Amount + Type Pill */}
          <div className="text-center pt-2 pb-1">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-3 shadow-sm border border-emerald-200/60 dark:border-emerald-800/60">
              {isSplit ? (
                <GitFork className="w-8 h-8 text-emerald-500" />
              ) : (
                <CategoryIcon name={transaction.category_icon || 'Wallet'} className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className={`text-2xl font-black tracking-tight ${
                transaction.type === 'expense' 
                  ? 'text-rose-500' 
                  : transaction.type === 'income' 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}>
                {transaction.type === 'expense' ? '- ' : transaction.type === 'income' ? '+ ' : ''}
                Rp {transaction.amount.toLocaleString('id-ID')}
              </h3>

              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>
                  {transaction.type === 'expense' 
                    ? 'Pengeluaran' 
                    : transaction.type === 'income' 
                    ? 'Pemasukan' 
                    : 'Transfer Saldo'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Metadata Card */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex items-center justify-between first:pt-0">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Kategori
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {isSplit ? `${transaction.splits!.length} kategori` : transaction.category}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Tanggal
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formattedDate}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Waktu
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {transaction.time || '07.00'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5" />
                Rekening / Dompet
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {transaction.account_name}
              </span>
            </div>

            {transaction.to_account_name && (
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  Ke Rekening
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {transaction.to_account_name}
                </span>
              </div>
            )}

            {Boolean(transaction.admin_fee && transaction.admin_fee > 0) && (
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Biaya Admin</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Rp {transaction.admin_fee?.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            {transaction.note && (
              <div className="py-2.5 flex items-start justify-between gap-3 last:pb-0">
                <span className="text-slate-400 font-medium flex items-center gap-2 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                  Catatan
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-right">
                  {transaction.note}
                </span>
              </div>
            )}
          </div>

          {/* Rincian Kategori (Split Breakdown) if Applicable */}
          {isSplit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Rincian kategori
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                  {transaction.splits!.length} kategori
                </span>
              </div>

              <div className="bg-white dark:bg-slate-850 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5">
                {transaction.splits!.map((split, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: split.category_color || '#10B981' }}
                      >
                        <CategoryIcon name={split.category_icon || 'Tag'} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {split.category}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Porsi: {split.percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        Rp {split.amount.toLocaleString('id-ID')}
                      </span>
                      <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {split.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-95 active:scale-98 transition-all shadow-md"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
