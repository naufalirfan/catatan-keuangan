'use client';

import React, { useState } from 'react';
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
  ShieldCheck,
  Cloud,
  Users,
  Coins
} from 'lucide-react';
import SuperAdminMemberManager from '@/components/SuperAdminMemberManager';
import SavingsGoalModal from '@/components/SavingsGoalModal';
import { SavingsGoal } from '@/types/finance';

export default function DashboardPage() {
  const { 
    user, 
    userPlan,
    setUserPlan,
    isSuperAdmin,
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

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-5 space-y-5">
      
      {/* User Greeting & Plan Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {currentDateFormatted}
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Halo, {user?.name.split(' ')[0] || 'Kawan'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Dashboard Plan Switcher */}
          <button
            onClick={() => setShowPlanModal(true)}
            title="Klik untuk ubah paket Free / Pro"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] text-slate-700 dark:text-slate-300 transition-colors hover:border-slate-300 dark:hover:border-slate-600"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold">{userPlan === 'pro' ? 'PRO' : 'FREE'}</span>
          </button>

          <button
            onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            aria-label="Sembunyikan Saldo"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141720] border border-transparent hover:border-slate-200 dark:border-[#232a3b] transition-colors"
          >
            {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Superadmin Quick Switcher Bar (if superadmin) */}
      {isSuperAdmin && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <div>
              <span className="font-semibold text-amber-900 dark:text-amber-300">
                Superadmin (naufalfaster@gmail.com)
              </span>
              <p className="text-[10px] text-amber-700 dark:text-amber-400">
                Status saat ini: <strong className="uppercase">{userPlan}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setUserPlan(userPlan === 'pro' ? 'free' : 'pro')}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors"
          >
            Switch ke {userPlan === 'pro' ? 'FREE' : 'PRO'}
          </button>
        </div>
      )}

      {/* Superadmin Member Management Panel */}
      {isSuperAdmin && <SuperAdminMemberManager />}

      {/* Hero Financial Card (Swiss Ledger Craft) */}
      <div className="rounded-2xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] p-5 md:p-6 text-slate-900 dark:text-white shadow-sm space-y-4">
        
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Total Saldo Bersih
            </span>
            <div className="text-3xl font-bold tracking-tight mt-1 tabular-nums text-slate-900 dark:text-white">
              {isBalanceHidden ? '••••••••' : `Rp ${totalBalance.toLocaleString('id-ID')}`}
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1e2433] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#232a3b] text-[11px] font-medium">
            {accounts.length} Rekening
          </span>
        </div>

        {/* Income vs Expense Breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-slate-100 dark:border-[#232a3b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">Pemasukan Bulan Ini</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {isBalanceHidden ? '••••••' : `+Rp ${totalIncomeMonth.toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">Pengeluaran Bulan Ini</span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {isBalanceHidden ? '••••••' : `-Rp ${totalExpenseMonth.toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Net Cash Flow Indicator */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100/60 dark:border-[#232a3b]/60">
          <span className="text-slate-500 dark:text-slate-400">Arus Kas Bersih:</span>
          <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] tabular-nums ${
            netCashFlowMonth >= 0 
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
          }`}>
            {netCashFlowMonth >= 0 ? '+' : ''}
            {isBalanceHidden ? '••••' : `Rp ${netCashFlowMonth.toLocaleString('id-ID')}`}
          </span>
        </div>

      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button
          onClick={() => openManualModal('expense')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all active:scale-95 group min-h-[44px]"
        >
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#1e2433] text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Manual
          </span>
        </button>

        <Link
          href="/ai-input"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all active:scale-95 group min-h-[44px]"
        >
          <div className="p-2 rounded-lg bg-teal-600/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Scan AI
          </span>
        </Link>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] hover:border-slate-400 dark:hover:border-slate-600 transition-all active:scale-95 group min-h-[44px]"
        >
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#1e2433] text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Transfer
          </span>
        </button>

        <Link
          href="/rekening"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] hover:border-slate-400 dark:hover:border-slate-600 transition-all active:scale-95 group min-h-[44px]"
        >
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#1e2433] text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Rekening
          </span>
        </Link>

        <Link
          href="/hutang"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] hover:border-slate-400 dark:hover:border-slate-600 transition-all active:scale-95 group min-h-[44px]"
        >
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#1e2433] text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Hutang
          </span>
        </Link>

        <button
          onClick={() => setIsDriveModalOpen(true)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] hover:border-slate-400 dark:hover:border-slate-600 transition-all active:scale-95 group min-h-[44px]"
        >
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#1e2433] text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            <Cloud className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            G-Drive
          </span>
        </button>
      </div>

      {/* Accounts & Wallets Horizontal Scroller */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Rekening & Dompet
          </h2>
          <Link
            href="/rekening"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            Kelola ({accounts.length})
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {accounts.map((acc) => (
            <Link
              key={acc.id}
              href="/rekening"
              className="min-w-[170px] snap-start p-4 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: acc.color }}
                >
                  <CategoryIcon name={acc.icon} className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1e2433] text-slate-500 dark:text-slate-400">
                  {acc.type}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {acc.name}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                  {isBalanceHidden ? '••••••' : `Rp ${acc.balance.toLocaleString('id-ID')}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Catatan Hutang Widget */}
      {debts && debts.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                Catatan Hutang & Piutang
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {debts.filter(d => d.status === 'unpaid').length} transaksi belum lunas
              </p>
            </div>
            <Link href="/hutang" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {debts.filter(d => d.status === 'unpaid').slice(0, 2).map((debt) => (
              <Link
                key={debt.id}
                href="/hutang"
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#1e2433] border border-slate-200/60 dark:border-[#232a3b] hover:border-indigo-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {debt.person_name}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    debt.type === 'receivable' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {debt.type === 'receivable' ? 'Piutang' : 'Hutang'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                  Rp {(debt.total_amount - (debt.paid_amount || 0)).toLocaleString('id-ID')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pengeluaran Terbesar Bulan Ini */}
      {categoryExpensesMonth.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Pengeluaran Terbesar Bulan Ini
            </h2>
            <Link href="/analitik" className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center">
              Detail <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {categoryExpensesMonth.slice(0, 3).map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.category}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    Rp {cat.amount.toLocaleString('id-ID')} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1e2433] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Tabungan Preview Widget */}
      {savingsGoals.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Target Tabungan
              </h2>
            </div>
            <Link href="/analitik" className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {savingsGoals.slice(0, 2).map((goal) => {
              const pct = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
              return (
                <div key={goal.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#1e2433] border border-slate-200/60 dark:border-[#232a3b] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {goal.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => openDepositModal(goal)}
                      className="px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-semibold transition-colors flex items-center gap-1"
                    >
                      + Nabung
                    </button>
                  </div>
                  <div className="flex justify-between text-[11px] tabular-nums">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Rp {goal.current_amount.toLocaleString('id-ID')} / Rp {goal.target_amount.toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, pct)}%`, backgroundColor: goal.color || '#0d9488' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Transaksi Terkini
          </h2>
          <Link href="/transaksi" className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center">
            Semua ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] text-center space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada transaksi tercatat untuk akun ini.</p>
            <button
              onClick={() => openManualModal('expense')}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors"
            >
              Mulai Catat Transaksi
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: tx.category_color || '#0d9488' }}
                  >
                    <CategoryIcon name={tx.category_icon || 'Wallet'} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {tx.note || tx.category}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{tx.account_name}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`text-xs font-bold block tabular-nums ${
                      tx.type === 'expense'
                        ? 'text-rose-600 dark:text-rose-400'
                        : tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                      Rp {tx.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] uppercase font-semibold text-slate-400 dark:text-slate-500">
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