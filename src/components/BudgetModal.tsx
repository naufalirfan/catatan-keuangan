'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import CategoryIcon from '@/components/CategoryIcon';
import { 
  X, 
  Target, 
  Check, 
  Trash2, 
  Sparkles,
  AlertCircle,
  TrendingDown
} from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string | null;
}

export default function BudgetModal({
  isOpen,
  onClose,
  categoryName: initialCategory,
}: BudgetModalProps) {
  const { categories, budgets, updateBudget, deleteBudget, categoryExpensesMonth } = useFinance();

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || expenseCategories[0]?.name || ''
  );
  const [limitInput, setLimitInput] = useState<string>('');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else if (expenseCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(expenseCategories[0].name);
    }
  }, [initialCategory, expenseCategories, selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      const existing = budgets.find((b) => b.category === selectedCategory);
      setLimitInput(existing?.limit_amount ? existing.limit_amount.toLocaleString('id-ID') : '');
    }
  }, [selectedCategory, budgets]);

  if (!isOpen) return null;

  const currentCategoryObj = categories.find((c) => c.name === selectedCategory);
  const currentSpent = categoryExpensesMonth.find((c) => c.category === selectedCategory)?.amount || 0;
  const existingBudget = budgets.find((b) => b.category === selectedCategory);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(limitInput.replace(/\D/g, ''), 10);
    if (!parsed || parsed <= 0) {
      alert('Masukkan batas anggaran yang valid lebih dari 0!');
      return;
    }

    updateBudget(selectedCategory, parsed);
    onClose();
  };

  const handleDeleteBudget = () => {
    if (confirm(`Hapus batas anggaran untuk kategori "${selectedCategory}"?`)) {
      deleteBudget(selectedCategory);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Atur Anggaran Kategori
              </h3>
              <p className="text-[11px] text-slate-400">
                Tentukan batas maksimal pengeluaran bulanan
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

        {/* Body Form */}
        <form onSubmit={handleSave} id="budget-form" className="p-5 space-y-4">
          
          {/* Pilih Kategori */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Kategori Pengeluaran
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} {budgets.some((b) => b.category === c.name) ? '★ (Ada Anggaran)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Current Spent Info Card */}
          {currentCategoryObj && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-sm"
                  style={{ backgroundColor: currentCategoryObj.color }}
                >
                  <CategoryIcon name={currentCategoryObj.icon} className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {currentCategoryObj.name}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Pengeluaran bulan ini
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-rose-500">
                  Rp {currentSpent.toLocaleString('id-ID')}
                </span>
                <p className="text-[10px] text-slate-400">
                  {existingBudget ? `Batas: Rp ${existingBudget.limit_amount.toLocaleString('id-ID')}` : 'Belum dibatasi'}
                </p>
              </div>
            </div>
          )}

          {/* Input Batas Anggaran (Rp) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Batas Anggaran Bulanan (Limit Rp)</span>
              <span className="text-[10px] text-slate-400">Rupiah per bulan</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={limitInput}
                onChange={(e) => {
                  const num = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  setLimitInput(num ? num.toLocaleString('id-ID') : '');
                }}
                placeholder="Contoh: 1.500.000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[300000, 500000, 1000000, 2000000, 3000000, 5000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLimitInput(preset.toLocaleString('id-ID'))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {(preset / 1000).toLocaleString('id-ID')}rb
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>
              Sistem akan otomatis memberi peringatan waspada jika pemakaian melebihi 75%, dan alarm merah jika melewati 100%.
            </span>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          {existingBudget ? (
            <button
              type="button"
              onClick={handleDeleteBudget}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Hapus Batas Anggaran"
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
              form="budget-form"
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Anggaran</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
