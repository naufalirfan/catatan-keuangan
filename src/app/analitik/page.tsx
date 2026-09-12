'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import CategoryIcon from '@/components/CategoryIcon';
import { 
  PieChart, 
  BarChart3,
  Activity,
  TrendingUp, 
  TrendingDown, 
  Target, 
  Sparkles,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function AnalitikPage() {
  const { 
    transactions,
    totalIncomeMonth, 
    totalExpenseMonth, 
    netCashFlowMonth,
    categoryExpensesMonth, 
    budgets, 
    updateBudget, 
    categories 
  } = useFinance();

  const [activeChartTab, setActiveChartTab] = useState<'category' | 'comparison' | 'daily'>('category');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetLimitInput, setBudgetLimitInput] = useState<string>('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const savingsRate = totalIncomeMonth > 0 
    ? Math.max(0, Math.round(((totalIncomeMonth - totalExpenseMonth) / totalIncomeMonth) * 100))
    : 0;

  const currentMonthStr = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

  // 1. Monthly History (Last 5 Months) for Comparison Bar Chart
  const monthlyComparisonData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = d.toISOString().slice(0, 7);
      const label = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);
      
      const mTx = transactions.filter((t) => t.date.startsWith(prefix));
      const income = mTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = mTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      months.push({
        prefix,
        label,
        income,
        expense,
        net: income - expense,
      });
    }

    const maxVal = Math.max(
      ...months.map((m) => Math.max(m.income, m.expense)),
      100000
    );

    return { months, maxVal };
  }, [transactions]);

  // 2. Daily Expenses Trend for Current Month
  const dailySpendingTrend = useMemo(() => {
    const now = new Date();
    const currentPrefix = now.toISOString().slice(0, 7);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();

    const dailyMap = new Array(daysInMonth).fill(0);

    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentPrefix))
      .forEach((t) => {
        const day = parseInt(t.date.slice(8, 10), 10);
        if (day >= 1 && day <= daysInMonth) {
          dailyMap[day - 1] += t.amount;
        }
      });

    const maxDaily = Math.max(...dailyMap, 50000);

    return {
      dailyMap,
      daysInMonth,
      currentDay,
      maxDaily,
    };
  }, [transactions]);

  // 3. SVG Doughnut Chart Segments
  const doughnutData = useMemo(() => {
    const total = categoryExpensesMonth.reduce((sum, c) => sum + c.amount, 0) || 1;
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    const segments = categoryExpensesMonth.map((cat) => {
      const fraction = cat.amount / total;
      const strokeDasharray = `${fraction * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += fraction;

      return {
        ...cat,
        strokeDasharray,
        strokeDashoffset,
      };
    });

    return { segments, circumference, radius, total };
  }, [categoryExpensesMonth]);

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
          <span className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shadow-sm">
            <PieChart className="w-5 h-5" />
          </span>
          Analitik & Grafik Keuangan
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Visualisasi cerdas arus kas periode {currentMonthStr}
        </p>
      </div>

      {/* Monthly Health Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ringkasan Arus Kas Bulan Ini
          </h2>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            netCashFlowMonth >= 0 
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          }`}>
            {netCashFlowMonth >= 0 ? '+ Surplus' : '- Defisit'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Pemasukan
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white truncate">
              Rp {totalIncomeMonth.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-1">
              <TrendingDown className="w-3.5 h-3.5" /> Pengeluaran
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white truncate">
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
        </div>
      </div>

      {/* GRAPH CARD WITH MULTI-TAB VIEW */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Chart Selector Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            Visualisasi Grafik
          </h2>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] font-semibold">
            <button
              onClick={() => setActiveChartTab('category')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeChartTab === 'category'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kategori
            </button>
            <button
              onClick={() => setActiveChartTab('comparison')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeChartTab === 'comparison'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setActiveChartTab('daily')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeChartTab === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Harian
            </button>
          </div>
        </div>

        {/* TAB 1: SVG DOUGHNUT CHART FOR CATEGORIES */}
        {activeChartTab === 'category' && (
          <div className="space-y-4">
            {categoryExpensesMonth.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Belum ada pengeluaran yang tercatat di bulan ini.
              </div>
            ) : (
              <div>
                {/* SVG Circular Doughnut */}
                <div className="relative flex items-center justify-center my-2">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 140 140">
                    <circle
                      cx="70"
                      cy="70"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      className="text-slate-100 dark:text-slate-800"
                      fill="none"
                    />
                    {doughnutData.segments.map((seg) => (
                      <circle
                        key={seg.category}
                        cx="70"
                        cy="70"
                        r="56"
                        stroke={seg.color}
                        strokeWidth={hoveredCategory === seg.category ? '20' : '16'}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredCategory(seg.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    ))}
                  </svg>

                  {/* Inner text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {hoveredCategory || 'Total Pengeluaran'}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[130px]">
                      Rp {hoveredCategory 
                        ? (categoryExpensesMonth.find((c) => c.category === hoveredCategory)?.amount.toLocaleString('id-ID') || 0)
                        : totalExpenseMonth.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Category Legend & Percentages */}
                <div className="space-y-2.5 pt-2">
                  {categoryExpensesMonth.map((cat) => (
                    <div 
                      key={cat.category}
                      onMouseEnter={() => setHoveredCategory(cat.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`p-2 rounded-xl transition-all ${
                        hoveredCategory === cat.category ? 'bg-slate-100 dark:bg-slate-800' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: cat.color }} 
                          />
                          {cat.category}
                        </span>
                        <div className="text-right font-bold text-slate-900 dark:text-white">
                          Rp {cat.amount.toLocaleString('id-ID')}
                          <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">
                            ({cat.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MONTHLY COMPARISON BAR CHART (5 MONTHS) */}
        {activeChartTab === 'comparison' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Pemasukan
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Pengeluaran
                </span>
              </div>
              <span className="text-[10px] font-medium">Tren 5 Bulan Terakhir</span>
            </div>

            {/* Bars container */}
            <div className="h-44 pt-6 pb-2 flex items-end justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
              {monthlyComparisonData.months.map((m) => {
                const incomeHeight = Math.max(8, Math.round((m.income / monthlyComparisonData.maxVal) * 110));
                const expenseHeight = Math.max(8, Math.round((m.expense / monthlyComparisonData.maxVal) * 110));

                return (
                  <div key={m.prefix} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-[120px]">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incomeHeight}px` }}
                        className="w-1/2 max-w-[14px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 relative group"
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900 text-[9px] text-white whitespace-nowrap pointer-events-none z-20 shadow-md">
                          +Rp {(m.income / 1000).toFixed(0)}k
                        </span>
                      </div>

                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expenseHeight}px` }}
                        className="w-1/2 max-w-[14px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-500 relative group"
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900 text-[9px] text-white whitespace-nowrap pointer-events-none z-20 shadow-md">
                          -Rp {(m.expense / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
              <span>Arus Kas Bulan Ini ({currentMonthStr.split(' ')[0]}):</span>
              <span className={`font-bold ${netCashFlowMonth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {netCashFlowMonth >= 0 ? '+' : ''}Rp {netCashFlowMonth.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: DAILY EXPENSE TREND CHART */}
        {activeChartTab === 'daily' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Aktivitas Pengeluaran Harian (Tgl 1 - {dailySpendingTrend.daysInMonth})</span>
              <span className="font-semibold text-rose-500">Puncak: Rp {dailySpendingTrend.maxDaily.toLocaleString('id-ID')}</span>
            </div>

            {/* Daily Bars / Heat Columns */}
            <div className="h-36 pt-4 pb-2 flex items-end justify-between gap-1 border-b border-slate-100 dark:border-slate-800">
              {dailySpendingTrend.dailyMap.map((amount, idx) => {
                const day = idx + 1;
                const isToday = day === dailySpendingTrend.currentDay;
                const height = amount > 0 
                  ? Math.max(10, Math.round((amount / dailySpendingTrend.maxDaily) * 100))
                  : 4;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div
                      style={{ height: `${height}px` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        amount > 0
                          ? isToday
                            ? 'bg-amber-500 shadow-sm'
                            : 'bg-rose-500/80 hover:bg-rose-500'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900 text-[9px] text-white whitespace-nowrap pointer-events-none z-20 shadow-md">
                      Tgl {day}: Rp {amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Tgl 1</span>
              <span className="text-amber-500 font-bold">Hari Ini (Tgl {dailySpendingTrend.currentDay})</span>
              <span>Tgl {dailySpendingTrend.daysInMonth}</span>
            </div>
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
                          className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
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
