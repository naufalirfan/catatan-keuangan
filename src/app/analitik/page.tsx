'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import CategoryIcon from '@/components/CategoryIcon';
import SavingsGoalModal from '@/components/SavingsGoalModal';
import BudgetModal from '@/components/BudgetModal';
import { SavingsGoal } from '@/types/finance';
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
  ArrowRight,
  Coins,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Flame,
  Laptop,
  Car,
  Home,
  Plane,
  Shield,
  GraduationCap,
  Gift,
  Smartphone,
  ChevronRight
} from 'lucide-react';

const SAVINGS_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Shield,
  Laptop,
  Car,
  Home,
  Plane,
  GraduationCap,
  Gift,
  Smartphone,
  Flame,
};

export default function AnalitikPage() {
  const { 
    transactions,
    totalIncomeMonth, 
    totalExpenseMonth, 
    netCashFlowMonth,
    categoryExpensesMonth, 
    budgets, 
    updateBudget, 
    categories,
    savingsGoals,
  } = useFinance();

  // Top Main Tabs: 'analytics' | 'budget' | 'savings'
  const [mainTab, setMainTab] = useState<'analytics' | 'budget' | 'savings'>('analytics');

  // Chart sub-tabs for Analytics view
  const [activeChartTab, setActiveChartTab] = useState<'category' | 'comparison' | 'daily'>('category');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Budget Filter: 'all' | 'budgeted' | 'overbudget'
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'budgeted' | 'overbudget'>('all');

  // Modals state
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [savingsModalMode, setSavingsModalMode] = useState<'create_edit' | 'deposit'>('create_edit');
  const [selectedGoalForModal, setSelectedGoalForModal] = useState<SavingsGoal | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedCategoryForBudget, setSelectedCategoryForBudget] = useState<string | null>(null);

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

  // Budget Calculations
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + (b.limit_amount || 0), 0);
  
  // Total spent only on categories that have a budget set
  const budgetedCategories = budgets.map((b) => b.category);
  const totalBudgetedSpent = categoryExpensesMonth
    .filter((c) => budgetedCategories.includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);

  const budgetRemaining = Math.max(0, totalBudgetLimit - totalBudgetedSpent);
  const overallBudgetPct = totalBudgetLimit > 0 ? Math.round((totalBudgetedSpent / totalBudgetLimit) * 100) : 0;

  // Savings Goals Calculations
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + (g.target_amount || 0), 0);
  const totalSavingsCollected = savingsGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
  const overallSavingsPct = totalSavingsTarget > 0 ? Math.round((totalSavingsCollected / totalSavingsTarget) * 100) : 0;

  const openDepositModal = (goal: SavingsGoal) => {
    setSelectedGoalForModal(goal);
    setSavingsModalMode('deposit');
    setIsSavingsModalOpen(true);
  };

  const openEditGoalModal = (goal: SavingsGoal) => {
    setSelectedGoalForModal(goal);
    setSavingsModalMode('create_edit');
    setIsSavingsModalOpen(true);
  };

  const openCreateGoalModal = () => {
    setSelectedGoalForModal(null);
    setSavingsModalMode('create_edit');
    setIsSavingsModalOpen(true);
  };

  const openBudgetModalFor = (catName?: string) => {
    setSelectedCategoryForBudget(catName || null);
    setIsBudgetModalOpen(true);
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-5 space-y-5 pb-24">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shadow-sm">
            <PieChart className="w-5 h-5" />
          </span>
          Perencanaan & Analitik Finansial
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Pantau arus kas, batas anggaran per kategori, dan target tabungan Anda
        </p>
      </div>

      {/* Top Main Navigation Tabs (3 Menu Utama) */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMainTab('analytics')}
          className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mainTab === 'analytics'
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PieChart className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Analitik</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('budget')}
          className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mainTab === 'budget'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Anggaran</span>
          {budgets.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">
              {budgets.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('savings')}
          className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mainTab === 'savings'
              ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Tabungan</span>
          {savingsGoals.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-extrabold">
              {savingsGoals.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ANALITIK & ARUS KAS BULANAN                                        */}
      {/* ========================================================================= */}
      {mainTab === 'analytics' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Monthly Health Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ringkasan Arus Kas {currentMonthStr}
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

          {/* Interactive Charts Section */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('category')}
                  className={`py-1 px-2.5 rounded-lg transition-all ${
                    activeChartTab === 'category'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Kategori
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('comparison')}
                  className={`py-1 px-2.5 rounded-lg transition-all ${
                    activeChartTab === 'comparison'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  5 Bulan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('daily')}
                  className={`py-1 px-2.5 rounded-lg transition-all ${
                    activeChartTab === 'daily'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Harian
                </button>
              </div>
            </div>

            {/* Doughnut Chart */}
            {activeChartTab === 'category' && (
              <div className="py-2 flex flex-col items-center">
                {categoryExpensesMonth.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Belum ada pengeluaran tercatat bulan ini.
                  </div>
                ) : (
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                      {doughnutData.segments.map((seg) => (
                        <circle
                          key={seg.category}
                          cx="70"
                          cy="70"
                          r={doughnutData.radius}
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth={hoveredCategory === seg.category ? '20' : '16'}
                          strokeDasharray={seg.strokeDasharray}
                          strokeDashoffset={seg.strokeDashoffset}
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setHoveredCategory(seg.category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {hoveredCategory || 'Total Biaya'}
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[110px]">
                        Rp {(hoveredCategory 
                          ? categoryExpensesMonth.find(c => c.category === hoveredCategory)?.amount || 0
                          : totalExpenseMonth
                        ).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comparison 5 Months Bar Chart */}
            {activeChartTab === 'comparison' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Perbandingan Arus Kas Bulanan</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Pemasukan</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"/> Pengeluaran</span>
                  </div>
                </div>

                <div className="flex items-end justify-between h-36 pt-4 px-2 border-b border-slate-100 dark:border-slate-800">
                  {monthlyComparisonData.months.map((m) => {
                    const incH = Math.round((m.income / monthlyComparisonData.maxVal) * 100);
                    const expH = Math.round((m.expense / monthlyComparisonData.maxVal) * 100);

                    return (
                      <div key={m.prefix} className="flex flex-col items-center gap-1 flex-1">
                        <div className="flex items-end gap-1 h-28 w-full justify-center">
                          <div
                            style={{ height: `${Math.max(4, incH)}%` }}
                            className="w-3 rounded-t-md bg-emerald-500/80 hover:bg-emerald-500 transition-all"
                            title={`Pemasukan ${m.label}: Rp ${m.income.toLocaleString('id-ID')}`}
                          />
                          <div
                            style={{ height: `${Math.max(4, expH)}%` }}
                            className="w-3 rounded-t-md bg-rose-500/80 hover:bg-rose-500 transition-all"
                            title={`Pengeluaran ${m.label}: Rp ${m.expense.toLocaleString('id-ID')}`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Expenses Chart */}
            {activeChartTab === 'daily' && (
              <div className="space-y-3 pt-2">
                <div className="text-[11px] text-slate-400 font-medium">
                  Grafik Pengeluaran Harian (Hari 1 s/d {dailySpendingTrend.daysInMonth})
                </div>
                <div className="flex items-end gap-0.5 h-32 pt-2 px-1 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                  {dailySpendingTrend.dailyMap.map((amt, idx) => {
                    const day = idx + 1;
                    const h = Math.round((amt / dailySpendingTrend.maxDaily) * 100);
                    const isToday = day === dailySpendingTrend.currentDay;

                    return (
                      <div key={day} className="flex-1 flex flex-col items-center h-full justify-end group min-w-[8px]">
                        <div
                          style={{ height: `${Math.max(4, h)}%` }}
                          className={`w-full rounded-t-sm transition-all ${
                            isToday ? 'bg-purple-500 ring-1 ring-purple-300' : 'bg-slate-300 dark:bg-slate-700 hover:bg-purple-400'
                          }`}
                          title={`Tgl ${day}: Rp ${amt.toLocaleString('id-ID')}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Category Expenses Breakdown Table */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rincian Kategori Pengeluaran
              </h2>
              <span className="text-[11px] text-slate-400">
                {categoryExpensesMonth.length} Kategori
              </span>
            </div>

            <div className="space-y-2.5">
              {categoryExpensesMonth.map((cat) => (
                <div
                  key={cat.category}
                  className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.category} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {cat.category}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {cat.percentage}% dari total pengeluaran
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Rp {cat.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ANGGARAN PER KATEGORI (BUDGETING)                                   */}
      {/* ========================================================================= */}
      {mainTab === 'budget' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Global Budget Health Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Ringkasan Anggaran Bulan Ini
                </span>
              </div>
              <button
                type="button"
                onClick={() => openBudgetModalFor()}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>+ Setel Anggaran</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-emerald-200">Total Anggaran Dialokasikan</span>
                <div className="text-xl font-black mt-0.5">
                  Rp {totalBudgetLimit.toLocaleString('id-ID')}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-emerald-200">Sisa Anggaran Bebas</span>
                <div className="text-xl font-black mt-0.5">
                  Rp {budgetRemaining.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Overall Budget Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-emerald-100 font-semibold">
                <span>Terpakai: Rp {totalBudgetedSpent.toLocaleString('id-ID')}</span>
                <span>{overallBudgetPct}%</span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallBudgetPct > 100 ? 'bg-rose-400' : overallBudgetPct > 75 ? 'bg-amber-300' : 'bg-white'
                  }`}
                  style={{ width: `${Math.min(100, overallBudgetPct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBudgetFilter('all')}
                className={`py-1 px-2.5 rounded-lg transition-all ${
                  budgetFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Semua ({expenseCategories.length})
              </button>
              <button
                type="button"
                onClick={() => setBudgetFilter('budgeted')}
                className={`py-1 px-2.5 rounded-lg transition-all ${
                  budgetFilter === 'budgeted'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Ada Anggaran ({budgets.length})
              </button>
              <button
                type="button"
                onClick={() => setBudgetFilter('overbudget')}
                className={`py-1 px-2.5 rounded-lg transition-all ${
                  budgetFilter === 'overbudget'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Melebihi Limit
              </button>
            </div>
          </div>

          {/* Category Budget Cards List */}
          <div className="space-y-3">
            {expenseCategories
              .filter((cat) => {
                const b = budgets.find((item) => item.category === cat.name);
                const spent = categoryExpensesMonth.find((c) => c.category === cat.name)?.amount || 0;
                const isOver = b && b.limit_amount > 0 && spent > b.limit_amount;

                if (budgetFilter === 'budgeted') return Boolean(b && b.limit_amount > 0);
                if (budgetFilter === 'overbudget') return Boolean(isOver);
                return true;
              })
              .map((cat) => {
                const spent = categoryExpensesMonth.find((c) => c.category === cat.name)?.amount || 0;
                const budgetItem = budgets.find((b) => b.category === cat.name);
                const limit = budgetItem?.limit_amount || 0;
                const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
                const isOver = limit > 0 && spent > limit;
                const sisa = Math.max(0, limit - spent);

                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {cat.name}
                            </span>
                            {isOver && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-600 text-[9px] font-black border border-rose-200 dark:border-rose-800">
                                Melebihi Limit!
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Terpakai: Rp {spent.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openBudgetModalFor(cat.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          limit > 0
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {limit > 0 ? `Batas: Rp ${limit.toLocaleString('id-ID')}` : '+ Pasang Batas'}
                      </button>
                    </div>

                    {limit > 0 ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className={isOver ? 'text-rose-500 font-bold' : 'text-slate-500'}>
                            {isOver ? `Lebih Rp ${(spent - limit).toLocaleString('id-ID')}` : `Sisa Aman: Rp ${sisa.toLocaleString('id-ID')}`}
                          </span>
                          <span className={`font-bold ${isOver ? 'text-rose-500' : pct > 75 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOver ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Kategori ini belum memiliki batas pengeluaran bulanan.
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TARGET TABUNGAN (SAVINGS GOALS & TARGETS)                           */}
      {/* ========================================================================= */}
      {mainTab === 'savings' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Savings Overview Hero Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-cyan-600/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-cyan-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">
                  Target Tabungan & Celengan
                </span>
              </div>
              <button
                type="button"
                onClick={openCreateGoalModal}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>+ Target Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-cyan-200">Total Terkumpul</span>
                <div className="text-xl font-black mt-0.5">
                  Rp {totalSavingsCollected.toLocaleString('id-ID')}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-cyan-200">Total Impian Target</span>
                <div className="text-xl font-black mt-0.5">
                  Rp {totalSavingsTarget.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Overall Savings Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-cyan-100 font-semibold">
                <span>Rata-rata Terkumpul</span>
                <span>{overallSavingsPct}%</span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, overallSavingsPct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* List of Savings Goals */}
          <div className="space-y-3.5">
            {savingsGoals.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <Coins className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Belum Ada Target Tabungan
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Mulai tetapkan tujuan menabung Anda untuk masa depan!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateGoalModal}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                >
                  + Buat Target Tabungan Pertama
                </button>
              </div>
            ) : (
              savingsGoals.map((goal) => {
                const pct = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
                const isCompleted = goal.current_amount >= goal.target_amount;
                const remaining = Math.max(0, goal.target_amount - goal.current_amount);
                const IconComp = SAVINGS_ICON_MAP[goal.icon] || Target;

                return (
                  <div
                    key={goal.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    {/* Header Target Card */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm shadow-sm"
                          style={{ backgroundColor: goal.color || '#10b981' }}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {goal.name}
                            </h3>
                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Tercapai!
                              </span>
                            )}
                          </div>
                          {goal.note && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {goal.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEditGoalModal(goal)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Target Tabungan"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar & Amount */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            Rp {goal.current_amount.toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold ml-1">
                            / Rp {goal.target_amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, pct)}%`,
                            backgroundColor: goal.color || '#10b981',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span>
                          {isCompleted ? '🎉 Selamat! Target telah terpenuhi' : `Kurang Rp ${remaining.toLocaleString('id-ID')} lagi`}
                        </span>
                        {goal.target_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Target: {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(goal.target_date))}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action: Setor Nabung Cepat */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openDepositModal(goal)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+ Nabung / Setor</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Savings Goal Modal (Create / Edit / Deposit) */}
      <SavingsGoalModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
        goalToEdit={selectedGoalForModal}
        mode={savingsModalMode}
      />

      {/* Category Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categoryName={selectedCategoryForBudget}
      />

    </div>
  );
}
