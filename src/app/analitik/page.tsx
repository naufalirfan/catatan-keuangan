'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import CategoryIcon from '@/components/CategoryIcon';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Sparkles,
  Info
} from 'lucide-react';

export default function AnalitikPage() {
  const { 
    totalIncomeMonth, 
    totalExpenseMonth, 
    netCashFlowMonth,
    categoryExpensesMonth, 
    budgets, 
    updateBudget, 
    categories 
  } = useFinance();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetLimitInput, setBudgetLimitInput] = useState<string>('');

  const savingsRate = totalIncomeMonth > 0 
    ? Math.max(0, Math.round(((totalIncomeMonth - totalExpenseMonth) / totalIncomeMonth) * 100))
    : 0;

  const currentMonthStr = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

  const handleSaveBudget = (catName: string) => {
    const limit = parseInt(budgetLimitInput.replace(/\D/g, ''), 10);
    if (!limit || limit <= 0) {
      alert('Masukkan nominal anggaran yang valid!');
      return;
    }
    updateBudget(catName, limit);
    setEditingCategory(null);
    setBudgetLimitInput('');
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-5 space-y-5">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <PieChart className="w-5 h-5" />
          </span>
          Analitik & Anggaran
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Evaluasi keuangan periode {currentMonthStr}
        </p>
      </div>

      {/* Monthly Health Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Ringkasan Arus Kas Bulan Ini
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Pemasukan
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white">
              Rp {totalIncomeMonth.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-1">
              <TrendingDown className="w-3.5 h-3.5" /> Pengeluaran
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white">
              Rp {totalExpenseMonth.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Savings Rate Meter */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Tingkat Tabungan (Savings Rate)
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {savingsRate}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {savingsRate >= 20 
              ? '✨ Sangat baik! Anda berhasil menyisihkan lebih dari 20% pemasukan.' 
              : '💡 Saran: Usahakan menyisihkan minimal 20% pemasukan untuk tabungan dan investasi.'}
          </p>
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Komposisi Pengeluaran
        </h2>

        {categoryExpensesMonth.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Belum ada pengeluaran di bulan ini.
          </p>
        ) : (
          <div className="space-y-3">
            {categoryExpensesMonth.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    {cat.category}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Rp {cat.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget Limit & Alert Tracker */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-500" />
              Batas Anggaran (Budgeting)
            </h2>
            <p className="text-[11px] text-slate-400">
              Kendalikan pengeluaran per kategori agar tidak boros
            </p>
          </div>
        </div>

        {/* Expense categories budgeting list */}
        <div className="space-y-3">
          {categories
            .filter((c) => c.type === 'expense')
            .slice(0, 5)
            .map((cat) => {
              const spent = categoryExpensesMonth.find((c) => c.category === cat.name)?.amount || 0;
              const budgetItem = budgets.find((b) => b.category === cat.name);
              const limit = budgetItem?.limit_amount || 0;
              const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
              const isOver = limit > 0 && spent > limit;

              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {cat.name}
                      </span>
                    </div>

                    {editingCategory === cat.name ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={budgetLimitInput}
                          onChange={(e) => {
                            const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
                            setBudgetLimitInput(n ? n.toLocaleString('id-ID') : '');
                          }}
                          placeholder="Nominal"
                          className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                        <button
                          onClick={() => handleSaveBudget(cat.name)}
                          className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="px-2 py-1 text-xs text-slate-400"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCategory(cat.name);
                          setBudgetLimitInput(limit ? limit.toLocaleString('id-ID') : '');
                        }}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {limit > 0 ? `Limit: Rp ${limit.toLocaleString('id-ID')}` : '+ Set Limit'}
                      </button>
                    )}
                  </div>

                  {limit > 0 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">
                          Terpakai: Rp {spent.toLocaleString('id-ID')}
                        </span>
                        <span className={`font-bold ${isOver ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          {pct}% {isOver && '(Melebihi Anggaran!)'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">
                      Belum ada batas anggaran. Klik &ldquo;+ Set Limit&rdquo; untuk menetapkan target bulanan.
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
}
