'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { TransactionType } from '@/types/finance';
import CategoryIcon from './CategoryIcon';
import confetti from 'canvas-confetti';
import { 
  X, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ArrowRightLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Check,
  Plus
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
}

export default function TransactionModal({ isOpen, onClose, initialType = 'expense' }: TransactionModalProps) {
  const { accounts, categories, addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [toAccount, setToAccount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmount('');
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
      setTime(today.toTimeString().slice(0, 5));
      setNote('');

      // Set default account & category
      if (accounts.length > 0) {
        setSelectedAccount(accounts[0].id);
        if (accounts.length > 1) {
          setToAccount(accounts[1].id);
        }
      }
    }
  }, [isOpen, initialType, accounts]);

  // Set default category when type or categories change
  useEffect(() => {
    const availableCats = categories.filter((c) => c.type === (type === 'transfer' ? 'expense' : type));
    if (availableCats.length > 0) {
      setSelectedCategory(availableCats[0].name);
    }
  }, [type, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) => c.type === (type === 'transfer' ? 'expense' : type)
  );

  const quickAmounts = [
    { label: '+10rb', value: 10000 },
    { label: '+20rb', value: 20000 },
    { label: '+50rb', value: 50000 },
    { label: '+100rb', value: 100000 },
    { label: '+500rb', value: 500000 },
    { label: '+1jt', value: 1000000 },
  ];

  const handleQuickAdd = (addVal: number) => {
    const current = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    const nextVal = current + addVal;
    setAmount(nextVal.toLocaleString('id-ID'));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmount('');
      return;
    }
    const num = parseInt(raw, 10);
    setAmount(num.toLocaleString('id-ID'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount <= 0) {
      alert('Silakan masukkan nominal yang valid!');
      return;
    }

    const acc = accounts.find((a) => a.id === selectedAccount);
    const toAcc = type === 'transfer' ? accounts.find((a) => a.id === toAccount) : undefined;
    const cat = categories.find((c) => c.name === selectedCategory);

    setIsSubmitting(true);
    try {
      await addTransaction({
        type,
        amount: numAmount,
        category: type === 'transfer' ? 'Transfer Saldo' : selectedCategory,
        category_icon: type === 'transfer' ? 'ArrowRightLeft' : cat?.icon,
        category_color: type === 'transfer' ? '#6366F1' : cat?.color,
        account_id: selectedAccount,
        account_name: acc ? acc.name : 'Rekening',
        to_account_id: type === 'transfer' ? toAccount : undefined,
        to_account_name: toAcc ? toAcc.name : undefined,
        date: date || new Date().toISOString().split('T')[0],
        time: time || '12:00',
        note: note.trim() || (type === 'transfer' ? `Transfer ke ${toAcc?.name}` : selectedCategory),
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Plus className="w-4 h-4" />
            </span>
            Catat Transaksi Manual
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          
          {/* Transaction Type Segmented Control */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                type === 'transfer'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transfer
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-xl text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-14 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickAmounts.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => handleQuickAdd(q.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker (if not transfer) */}
          {type !== 'transfer' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kategori
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-1 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] leading-tight line-clamp-2">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {type === 'transfer' ? 'Dari Rekening / Dompet' : 'Rekening / Dompet'}
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Rp {acc.balance.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ke Rekening Tujuan
                </label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts.filter((a) => a.id !== selectedAccount).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Rp {acc.balance.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Jam
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Catatan / Keterangan
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Makan siang bareng tim, Bensin motor, dll"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
