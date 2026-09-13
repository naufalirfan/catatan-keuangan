'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { SavingsGoal } from '@/types/finance';
import confetti from 'canvas-confetti';
import { 
  X, 
  Target, 
  Plus, 
  Sparkles, 
  Trash2, 
  Check, 
  Calendar,
  Wallet,
  Coins,
  ArrowUpRight,
  Laptop,
  Car,
  Home,
  Plane,
  Shield,
  GraduationCap,
  Gift,
  Smartphone,
  Flame,
  Clock
} from 'lucide-react';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
  mode?: 'create_edit' | 'deposit';
}

const AVAILABLE_ICONS = [
  { name: 'Target', icon: Target },
  { name: 'Shield', icon: Shield },
  { name: 'Laptop', icon: Laptop },
  { name: 'Car', icon: Car },
  { name: 'Home', icon: Home },
  { name: 'Plane', icon: Plane },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Gift', icon: Gift },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Flame', icon: Flame },
];

const AVAILABLE_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
  '#14b8a6', // teal
];

export default function SavingsGoalModal({
  isOpen,
  onClose,
  goalToEdit,
  mode = 'create_edit',
}: SavingsGoalModalProps) {
  const { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, depositToSavingsGoal, accounts } = useFinance();

  // Form State for Create/Edit
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [note, setNote] = useState('');

  // Form State for Deposit / Nabung
  const [depositAmount, setDepositAmount] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.target_amount.toLocaleString('id-ID'));
      setCurrentAmount(goalToEdit.current_amount.toLocaleString('id-ID'));
      setTargetDate(goalToEdit.target_date || '');
      setSelectedColor(goalToEdit.color || AVAILABLE_COLORS[0]);
      setSelectedIcon(goalToEdit.icon || 'Target');
      setNote(goalToEdit.note || '');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      setSelectedColor(AVAILABLE_COLORS[0]);
      setSelectedIcon('Target');
      setNote('');
    }
    setDepositAmount('');
    setSourceAccountId(accounts[0]?.id || '');
  }, [goalToEdit, isOpen, accounts]);

  if (!isOpen) return null;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseInt(targetAmount.replace(/\D/g, ''), 10);
    const parsedCurrent = parseInt(currentAmount.replace(/\D/g, ''), 10) || 0;

    if (!name.trim()) {
      alert('Nama target tabungan harus diisi!');
      return;
    }
    if (!parsedTarget || parsedTarget <= 0) {
      alert('Target nominal tabungan harus lebih dari 0!');
      return;
    }

    if (goalToEdit) {
      updateSavingsGoal(goalToEdit.id, {
        name: name.trim(),
        target_amount: parsedTarget,
        current_amount: parsedCurrent,
        target_date: targetDate || undefined,
        color: selectedColor,
        icon: selectedIcon,
        note: note.trim() || undefined,
      });
    } else {
      addSavingsGoal({
        name: name.trim(),
        target_amount: parsedTarget,
        current_amount: parsedCurrent,
        target_date: targetDate || undefined,
        color: selectedColor,
        icon: selectedIcon,
        note: note.trim() || undefined,
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    onClose();
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalToEdit) return;

    const parsedDeposit = parseInt(depositAmount.replace(/\D/g, ''), 10);
    if (!parsedDeposit || parsedDeposit <= 0) {
      alert('Masukkan nominal setoran nabung yang valid!');
      return;
    }

    depositToSavingsGoal(goalToEdit.id, parsedDeposit, sourceAccountId || undefined);

    // If goal completed or near complete, throw confetti!
    const newTotal = goalToEdit.current_amount + parsedDeposit;
    if (newTotal >= goalToEdit.target_amount) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!goalToEdit) return;
    if (confirm(`Hapus target tabungan "${goalToEdit.name}"?`)) {
      deleteSavingsGoal(goalToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: goalToEdit?.color || selectedColor }}
            >
              {mode === 'deposit' ? <Coins className="w-5 h-5" /> : <Target className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {mode === 'deposit'
                  ? `Setor Tabungan: ${goalToEdit?.name}`
                  : goalToEdit
                  ? 'Edit Target Tabungan'
                  : 'Buat Target Tabungan Baru'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'deposit'
                  ? 'Tambah saldo tabungan Anda untuk mempercepat pencapaian target'
                  : 'Tetapkan impian dan target nominal yang ingin dicapai'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {mode === 'deposit' && goalToEdit ? (
            /* DEPOSIT / NABUNG FORM */
            <form onSubmit={handleDeposit} className="space-y-4" id="deposit-form">
              {/* Target Progress Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Terkumpul saat ini</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Rp {goalToEdit.current_amount.toLocaleString('id-ID')} / Rp {goalToEdit.target_amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((goalToEdit.current_amount / goalToEdit.target_amount) * 100))}%`,
                      backgroundColor: goalToEdit.color || '#10b981',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>
                    {Math.round((goalToEdit.current_amount / goalToEdit.target_amount) * 100)}% tercapai
                  </span>
                  <span>
                    Kurang Rp {Math.max(0, goalToEdit.target_amount - goalToEdit.current_amount).toLocaleString('id-ID')} lagi
                  </span>
                </div>
              </div>

              {/* Input Nominal Setoran */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Nominal Setor (Rp)</span>
                  <span className="text-[10px] text-slate-400">Masukkan angka bulat</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={depositAmount}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/\D/g, ''), 10);
                      setDepositAmount(num ? num.toLocaleString('id-ID') : '');
                    }}
                    placeholder="Contoh: 250.000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[50000, 100000, 250000, 500000, 1000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(preset.toLocaleString('id-ID'))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      +{(preset / 1000).toLocaleString('id-ID')}rb
                    </button>
                  ))}
                </div>
              </div>

              {/* Sumber Rekening / Dompet (Opsional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Potong Dari Dompet/Rekening (Opsional)</span>
                </label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="">Jangan potong saldo rekening (catat progress saja)</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Saldo: Rp {acc.balance.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  Jika dipilih, saldo rekening ini akan otomatis dipotong dan dicatat sebagai pengeluaran tabungan.
                </p>
              </div>
            </form>
          ) : (
            /* CREATE / EDIT FORM */
            <form onSubmit={handleSaveGoal} className="space-y-3.5" id="goal-form">
              {/* Goal Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Target Tabungan
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Beli Laptop Baru, Dana Darurat, Umroh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Target & Current Amount */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Nominal (Rp)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetAmount}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/\D/g, ''), 10);
                      setTargetAmount(num ? num.toLocaleString('id-ID') : '');
                    }}
                    placeholder="10.000.000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Terkumpul Saat Ini (Rp)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={currentAmount}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/\D/g, ''), 10);
                      setCurrentAmount(num ? num.toLocaleString('id-ID') : '0');
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Target Date / Deadline */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    Target Tanggal / Deadline (Opsional)
                  </span>
                  <span className="text-[10px] text-slate-400">Kapan ingin tercapai?</span>
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Icon Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Ikon Target
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map(({ name: iconName, icon: IconComponent }) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        selectedIcon === iconName
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-2 ring-emerald-500 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Warna Tema
                </label>
                <div className="flex items-center gap-2">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-emerald-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Catatan / Motivasi
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Sisihkan minimal 500rb per bulan!"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          {mode === 'deposit' ? (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="deposit-form"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Setor Tabungan Sekarang</span>
              </button>
            </div>
          ) : (
            <>
              {goalToEdit ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Hapus Target Tabungan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="goal-form"
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{goalToEdit ? 'Simpan Perubahan' : 'Buat Target'}</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
