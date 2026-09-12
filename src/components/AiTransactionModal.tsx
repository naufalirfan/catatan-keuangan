'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ParsedAiTransaction } from '@/types/finance';
import CategoryIcon from './CategoryIcon';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  X, 
  Check, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ArrowRightLeft,
  Calendar,
  Wallet,
  FileText
} from 'lucide-react';

interface AiTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedAiTransaction | null;
}

export default function AiTransactionModal({
  isOpen,
  onClose,
  parsedData,
}: AiTransactionModalProps) {
  const { accounts, categories, addTransaction } = useFinance();

  // Local state for editable fields
  const [type, setType] = useState(parsedData?.type || 'expense');
  const [amount, setAmount] = useState(parsedData?.amount ? parsedData.amount.toLocaleString('id-ID') : '');
  const [category, setCategory] = useState(parsedData?.category || 'Pengeluaran Lainnya');
  const [account, setAccount] = useState(parsedData?.account || accounts[0]?.name || 'Uang Tunai (Dompet)');
  const [toAccount, setToAccount] = useState(parsedData?.to_account || accounts[1]?.name || '');
  const [note, setNote] = useState(parsedData?.note || '');
  const [date, setDate] = useState(parsedData?.date || new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync when parsedData changes
  React.useEffect(() => {
    if (parsedData) {
      setType(parsedData.type);
      setAmount(parsedData.amount.toLocaleString('id-ID'));
      setCategory(parsedData.category);
      setAccount(parsedData.account);
      setToAccount(parsedData.to_account || '');
      setNote(parsedData.note);
      setDate(parsedData.date);
    }
  }, [parsedData]);

  if (!isOpen || !parsedData) return null;

  const handleConfirm = async () => {
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount <= 0) {
      alert('Nominal harus lebih besar dari 0!');
      return;
    }

    // Match or create account
    let matchedAcc = accounts.find((a) => a.name.toLowerCase().includes(account.toLowerCase()) || account.toLowerCase().includes(a.name.toLowerCase()));
    if (!matchedAcc && accounts.length > 0) {
      matchedAcc = accounts[0];
    }

    let matchedToAcc = undefined;
    if (type === 'transfer') {
      matchedToAcc = accounts.find((a) => a.name.toLowerCase().includes(toAccount.toLowerCase()) || toAccount.toLowerCase().includes(a.name.toLowerCase()));
    }

    const matchedCat = categories.find((c) => c.name.toLowerCase() === category.toLowerCase());

    setIsSubmitting(true);
    try {
      await addTransaction({
        type,
        amount: numAmount,
        category: type === 'transfer' ? 'Transfer Saldo' : category,
        category_icon: type === 'transfer' ? 'ArrowRightLeft' : matchedCat?.icon || 'ShoppingBag',
        category_color: type === 'transfer' ? '#6366F1' : matchedCat?.color || '#3B82F6',
        account_id: matchedAcc ? matchedAcc.id : 'acc-cash',
        account_name: matchedAcc ? matchedAcc.name : account,
        to_account_id: matchedToAcc?.id,
        to_account_name: matchedToAcc?.name,
        date: date || new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        note: note || (parsedData.raw_text || 'Input AI'),
      });

      confetti({
        particleCount: 60,
        spread: 70,
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
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Hasil Parsing AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Silakan periksa atau sesuaikan sebelum disimpan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          
          {/* Raw Prompt Preview */}
          {parsedData.raw_text && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Teks Input Asli
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-0.5">
                &ldquo;{parsedData.raw_text}&rdquo;
              </p>
            </div>
          )}

          {/* Type Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                type === 'transfer'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transfer
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Nominal Terdeteksi
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const num = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  setAmount(num ? num.toLocaleString('id-ID') : '');
                }}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              >
                {categories
                  .filter((c) => c.type === (type === 'transfer' ? 'expense' : type))
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Rekening / Dompet
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note & Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Catatan
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Confirm Button */}
          <div className="pt-3">
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi AI'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
