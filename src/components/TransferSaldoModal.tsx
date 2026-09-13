'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  Calendar, 
  Clock, 
  Landmark, 
  Wallet, 
  Coins,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TransferSaldoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransferSaldoModal({ isOpen, onClose }: TransferSaldoModalProps) {
  const { accounts, transferBalance } = useFinance();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [adminFee, setAdminFee] = useState<string>('0');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const fromAcc = accounts.find((a) => a.id === fromAccountId);
  const toAcc = accounts.find((a) => a.id === toAccountId);

  const handleSwap = () => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    const numFee = parseInt(adminFee.replace(/\D/g, ''), 10) || 0;

    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Masukkan nominal transfer yang valid');
      return;
    }

    if (fromAccountId === toAccountId) {
      setErrorMsg('Rekening asal dan tujuan tidak boleh sama');
      return;
    }

    if (fromAcc && fromAcc.balance < (numAmount + numFee)) {
      setErrorMsg(`Saldo ${fromAcc.name} tidak cukup (Saldo: Rp ${fromAcc.balance.toLocaleString('id-ID')})`);
      return;
    }

    setIsSubmitting(true);
    try {
      await transferBalance(
        fromAccountId,
        toAccountId,
        numAmount,
        numFee,
        date,
        time,
        note
      );
      setAmount('');
      setAdminFee('0');
      setNote('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal melakukan transfer saldo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Transfer Saldo
          </h2>
          <button
            type="button"
            onClick={handleSwap}
            title="Tukar Rekening"
            className="p-2 rounded-2xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* DARI REKENING */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Dari Rekening
              </label>
              {fromAcc && (
                <span className="text-[10px] font-bold text-slate-500">
                  {fromAcc.balance.toLocaleString('id-ID')}
                </span>
              )}
            </div>

            <div className="relative">
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Rp {acc.balance.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
              <div 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-white pointer-events-none"
                style={{ backgroundColor: fromAcc?.color || '#0060AF' }}
              >
                <Landmark className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* KE REKENING */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Ke Rekening
              </label>
              {toAcc && (
                <span className="text-[10px] font-bold text-slate-500">
                  {toAcc.balance.toLocaleString('id-ID')}
                </span>
              )}
            </div>

            <div className="relative">
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Rp {acc.balance.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
              <div 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-white pointer-events-none"
                style={{ backgroundColor: toAcc?.color || '#4C3494' }}
              >
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* JUMLAH */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 block px-1">
              Jumlah
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount ? parseInt(amount.replace(/\D/g, ''), 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.000"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* TANGGAL & WAKTU */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 block px-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 block px-1">
                Waktu
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* BIAYA ADMINISTRATOR */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 block px-1">
              Biaya Administrator
            </label>
            <input
              type="text"
              value={adminFee ? parseInt(adminFee.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : '0'}
              onChange={(e) => setAdminFee(e.target.value)}
              placeholder="1.000"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* CATATAN TAMBAHAN (OPSIONAL) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 block px-1">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Top up saldo OVO mingguan"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* TOMBOL SIMPAN */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-sky-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses Transfer...' : 'Simpan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
