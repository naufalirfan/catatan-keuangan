'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useFinance } from '@/context/FinanceContext';
import CategoryIcon from '@/components/CategoryIcon';
import TransactionModal from '@/components/TransactionModal';
import TransferSaldoModal from '@/components/TransferSaldoModal';
import GoogleDriveModal from '@/components/GoogleDriveModal';
import { TransactionType } from '@/types/finance';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff, 
  Plus, 
  Camera, 
  ArrowRightLeft, 
  ChevronRight, 
  Wallet, 
  Crown,
  Trash2,
  Users,
  Coins
} from 'lucide-react';
import SavingsGoalModal from '@/components/SavingsGoalModal';
import { SavingsGoal } from '@/types/finance';

export default function DashboardPage() {
  const { 
    user, 
    userPlan,
    setShowPlanModal,
    totalBalance, 
    totalIncomeMonth, 
    totalExpenseMonth, 
    netCashFlowMonth,
    accounts, 
    transactions, 
    categoryExpensesMonth,
    deleteTransaction,
    savingsGoals,
    debts,
  } = useFinance();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Filter tag state for Recent Transactions
  const [selectedTxFilter, setSelectedTxFilter] = useState<string>('all');

  // Savings Goal Quick Modal
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [savingsModalMode, setSavingsModalMode] = useState<'create_edit' | 'deposit'>('deposit');
  const [selectedGoalForModal, setSelectedGoalForModal] = useState<SavingsGoal | null>(null);

  const openDepositModal = (goal: SavingsGoal) => {
    setSelectedGoalForModal(goal);
    setSavingsModalMode('deposit');
    setIsSavingsModalOpen(true);
  };

  const openManualModal = (type: TransactionType = 'expense') => {
    setModalType(type);
    setModalOpen(true);
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Calculate Savings Rate for Nordic Circular Ring
  const savingsRate = useMemo(() => {
    if (totalIncomeMonth <= 0) {
      return totalBalance > 0 ? 75 : 0;
    }
    const rate = Math.round(((totalIncomeMonth - totalExpenseMonth) / totalIncomeMonth) * 100);
    return Math.max(0, Math.min(100, rate));
  }, [totalIncomeMonth, totalExpenseMonth, totalBalance]);

  // Filtered transactions
  const filteredRecentTransactions = useMemo(() => {
    let list = transactions;
    if (selectedTxFilter !== 'all') {
      list = list.filter(t => t.category.toLowerCase().includes(selectedTxFilter.toLowerCase()));
    }
    return list.slice(0, 6);
  }, [transactions, selectedTxFilter]);

  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(transactions.map(t => t.category))).slice(0, 4);
    return cats;
  }, [transactions]);

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-5 space-y-5">
      
      {/* Header: Greeting & Plan Badge */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {currentDateFormatted}
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            Halo, {user?.name?.split(' ')[0] || 'Kawan'} <span>\u{1F44B}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Plan Badge */}
          <button
            onClick={() => setShowPlanModal(true)}
            title="Klik untuk info paket Free / Pro"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all active:scale-95 bg-amber-400 hover:bg-amber-500 text-slate-950"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{userPlan === 'pro' ? 'PRO' : 'FREE'}</span>
          </button>

          <button
            onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            aria-label="Sembunyikan Saldo"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hero Financial Card (Nordic Mint Neobank Midnight Anchor with Radial Gauge) */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#0b1329] p-6 text-white shadow-2xl border border-slate-800/80">
        
        {/* Top Bar: Title & Active Accounts Pill */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
              Total Saldo Bersih
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#00e599] tracking-tight mt-1 tabular-nums drop-shadow-sm">
              {isBalanceHidden ? 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢' : `Rp ${totalBalance.toLocaleString('id-ID')}`}
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
            {accounts.length} Akun Aktif
          </span>
        </div>

        {/* Middle Section: Radial Progress Gauge + Monthly Flow */}
        <div className="grid grid-cols-12 gap-3 items-center pt-5 pb-2">
          
          {/* Radial Circular Gauge */}
          <div className="col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-slate-800/80"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-[#00e599] transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={238.76}
                  strokeDashoffset={238.76 - (238.76 * savingsRate) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white tabular-nums leading-none">
                  {savingsRate}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                  Tersimpan
                </span>
              </div>
            </div>
          </div>

          {/* Income, Expense, Net Flow Stack */}
          <div className="col-span-7 space-y-2.5 pl-2 border-l border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Masuk:
              </span>
              <span className="font-extrabold text-emerald-400 tabular-nums">
                {isBalanceHidden ? 'â€¢â€¢â€¢â€¢â€¢â€¢' : `+Rp ${totalIncomeMonth.toLocaleString('id-ID')}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Keluar:
              </span>
              <span className="font-extrabold text-rose-400 tabular-nums">
                {isBalanceHidden ? 'â€¢â€¢â€¢â€¢â€¢â€¢' : `-Rp ${totalExpenseMonth.toLocaleString('id-ID')}`}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold text-[11px]">Arus Kas:</span>
              <span className={`font-black tabular-nums px-2 py-0.5 rounded-full text-[10px] ${
                netCashFlowMonth >= 0
                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {netCashFlowMonth >= 0 ? '+' : ''}
                {isBalanceHidden ? 'â€¢â€¢â€¢â€¢â€¢â€¢' : `Rp ${netCashFlowMonth.toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Action Pills Bar */}
      <div className="grid grid-cols-4 gap-2">
        <Link
          href="/ai-input"
          className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-[#00e599] hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center"
        >
          <Camera className="w-5 h-5 text-slate-950" />
          <span className="text-[11px] font-black">Scan AI</span>
        </Link>

        <button
          onClick={() => openManualModal('expense')}
          className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-emerald-500 active:scale-95 transition-all text-center group"
        >
          <div className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Catat</span>
        </button>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-sky-500 active:scale-95 transition-all text-center group"
        >
          <div className="p-1 rounded-lg text-sky-600 dark:text-sky-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Transfer</span>
        </button>

        <Link
          href="/hutang"
          className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-indigo-500 active:scale-95 transition-all text-center group"
        >
          <div className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Hutang</span>
        </Link>
      </div>

      {/* Modular Neobank Account Cards Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Rekening & Dompet
          </h2>
          <Link
            href="/rekening"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Kelola ({accounts.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {accounts.map((acc, idx) => {
            const isBca = acc.name.toLowerCase().includes('bca');
            const isMandiri = acc.name.toLowerCase().includes('mandiri');
            
            // Neobank branded card gradient tints
            const cardBg = isBca 
              ? 'bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/40 dark:to-[#121826] border-blue-200/80 dark:border-blue-900/50' 
              : isMandiri 
              ? 'bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-950/40 dark:to-[#121826] border-amber-200/80 dark:border-amber-900/50'
              : 'bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/40 dark:to-[#121826] border-emerald-200/80 dark:border-emerald-900/50';

            return (
              <Link
                key={acc.id}
                href="/rekening"
                className={`min-w-[185px] snap-start p-4.5 rounded-3xl border shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all ${cardBg}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ backgroundColor: acc.color }}
                  >
                    <CategoryIcon name={acc.icon} className="w-4 h-4" />
                  </span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                    {idx === 0 ? 'PRIMARY' : acc.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
                    {acc.name}
                  </p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-1 tabular-nums tracking-tight">
                    {isBalanceHidden ? 'â€¢â€¢â€¢â€¢â€¢â€¢' : `Rp ${acc.balance.toLocaleString('id-ID')}`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Catatan Hutang Widget */}
      {debts && debts.length > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                Catatan Hutang & Piutang
              </h2>
              <p className="text-[10px] text-slate-400">
                {debts.filter(d => d.status === 'unpaid').length} transaksi belum lunas
              </p>
            </div>
            <Link href="/hutang" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {debts.filter(d => d.status === 'unpaid').slice(0, 2).map((debt) => (
              <Link
                key={debt.id}
                href="/hutang"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0e1422] border border-slate-200/60 dark:border-slate-800 hover:border-indigo-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {debt.person_name}
                  </span>
                  <span className={`text-[10px] font-black ${
                    debt.type === 'receivable' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {debt.type === 'receivable' ? 'Piutang' : 'Hutang'}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                  Rp {(debt.total_amount - (debt.paid_amount || 0)).toLocaleString('id-ID')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Target Tabungan Preview Widget */}
      {savingsGoals.length > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Target Tabungan
              </h2>
            </div>
            <Link href="/analitik" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {savingsGoals.slice(0, 2).map((goal) => {
              const pct = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
              return (
                <div key={goal.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0e1422] border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {goal.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => openDepositModal(goal)}
                      className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black transition-colors flex items-center gap-1 shadow-sm"
                    >
                      + Nabung
                    </button>
                  </div>
                  <div className="flex justify-between text-[11px] tabular-nums font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Rp {goal.current_amount.toLocaleString('id-ID')} / Rp {goal.target_amount.toLocaleString('id-ID')}
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, pct)}%`, backgroundColor: goal.color || '#10b981' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions List with Neobank Pill Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Transaksi Terkini
          </h2>
          <Link href="/transaksi" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
            Semua ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Pills Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTxFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedTxFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-[#121826] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Semua
          </button>
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedTxFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedTxFilter === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#121826] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredRecentTransactions.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400">Belum ada transaksi pada kategori ini.</p>
            <button
              onClick={() => openManualModal('expense')}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-sm"
            >
              Mulai Catat Transaksi
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: tx.category_color || '#10b981' }}
                  >
                    <CategoryIcon name={tx.category_icon || 'Wallet'} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {tx.note || tx.category}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">{tx.account_name}</span>
                      <span>â€¢</span>
                      <span>{tx.date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`text-xs font-black block tabular-nums ${
                      tx.type === 'expense'
                        ? 'text-rose-500'
                        : tx.type === 'income'
                        ? 'text-emerald-500'
                        : 'text-indigo-500'
                    }`}>
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                      Rp {tx.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">
                      {tx.category}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Hapus transaksi ini?')) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    title="Hapus"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={modalType}
      />
      <TransferSaldoModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />
      <SavingsGoalModal
        isOpen={isSavingsModalOpen}
        onClose={() => {
          setIsSavingsModalOpen(false);
          setSelectedGoalForModal(null);
        }}
        goalToEdit={selectedGoalForModal}
        mode={savingsModalMode}
      />
    </div>
  );
}