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
  Sparkles, 
  Camera, 
  ArrowRightLeft, 
  ChevronRight, 
  Wallet, 
  Crown,
  Trash2,
  ShieldCheck,
  Zap,
  Cloud,
  Users,
  CheckCircle2
} from 'lucide-react';
import SuperAdminMemberManager from '@/components/SuperAdminMemberManager';
import SavingsGoalModal from '@/components/SavingsGoalModal';
import { SavingsGoal } from '@/types/finance';
import { Coins, Target } from 'lucide-react';

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
    budgets,
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
      
      {/* User Greeting & Plan Switcher Banner */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {currentDateFormatted}
          </span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Halo, {user?.name.split(' ')[0] || 'Kawan'}! 👋
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Dashboard Plan Switcher Pill */}
          <button
            onClick={() => setShowPlanModal(true)}
            title="Klik untuk ubah paket Free / Pro"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all active:scale-95 ${
              userPlan === 'pro'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{userPlan === 'pro' ? 'PRO' : 'FREE'}</span>
            <span className="text-[10px] font-normal opacity-80 underline">Ubah</span>
          </button>

          <button
            onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            aria-label="Sembunyikan Saldo"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isBalanceHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Superadmin Quick Switcher Bar (if superadmin) */}
      {isSuperAdmin && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <div>
              <span className="font-bold text-amber-800 dark:text-amber-300">
                Superadmin (naufalfaster@gmail.com)
              </span>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-400">
                Status saat ini: <strong className="uppercase">{userPlan}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setUserPlan(userPlan === 'pro' ? 'free' : 'pro')}
              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors"
            >
              Switch ke {userPlan === 'pro' ? 'FREE' : 'PRO'}
            </button>
          </div>
        </div>
      )}

      {/* Superadmin Member Management Panel */}
      {isSuperAdmin && <SuperAdminMemberManager />}

      {/* Hero Financial Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl shadow-emerald-600/20">
        
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative space-y-4">
          
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-100 tracking-wide uppercase">
                Total Saldo Bersih
              </span>
              <div className="text-3xl font-black tracking-tight mt-1">
                {isBalanceHidden ? '••••••••' : `Rp ${totalBalance.toLocaleString('id-ID')}`}
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md">
              1 Akun • 1 Catatan
            </span>
          </div>

          {/* Income vs Expense Pills */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/15">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/15 text-emerald-200">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-100 block">Pemasukan Bulan Ini</span>
                <span className="text-sm font-bold">
                  {isBalanceHidden ? '••••••' : `+Rp ${totalIncomeMonth.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/15 text-rose-200">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-100 block">Pengeluaran Bulan Ini</span>
                <span className="text-sm font-bold">
                  {isBalanceHidden ? '••••••' : `-Rp ${totalExpenseMonth.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>
          </div>

          {/* Net Cash Flow Indicator */}
          <div className="flex items-center justify-between text-[11px] font-medium pt-1 text-emerald-100">
            <span>Arus Kas Bersih:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
              netCashFlowMonth >= 0 ? 'bg-emerald-400/30 text-emerald-100' : 'bg-rose-500/30 text-rose-100'
            }`}>
              {netCashFlowMonth >= 0 ? '+' : ''}
              {isBalanceHidden ? '••••' : `Rp ${netCashFlowMonth.toLocaleString('id-ID')}`}
            </span>
          </div>

        </div>

      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button
          onClick={() => openManualModal('expense')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Manual
          </span>
        </button>

        <Link
          href="/ai-input"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/30 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Input AI
          </span>
        </Link>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Transfer
          </span>
        </button>

        <Link
          href="/rekening"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Rekening
          </span>
        </Link>

        <Link
          href="/hutang"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Hutang
          </span>
        </Link>

        <button
          onClick={() => setIsDriveModalOpen(true)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
            <Cloud className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            G-Drive
          </span>
        </button>
      </div>

      {/* Accounts & Wallets Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Rekening & Dompet
          </h2>
          <Link
            href="/rekening"
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            Kelola ({accounts.length}) ➔
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {accounts.map((acc) => (
            <Link
              key={acc.id}
              href="/rekening"
              className="min-w-[170px] snap-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-sky-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: acc.color }}
                >
                  <CategoryIcon name={acc.icon} className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {acc.type}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {acc.name}
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {isBalanceHidden ? '••••••' : `Rp ${acc.balance.toLocaleString('id-ID')}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Catatan Hutang Widget */}
      {debts && debts.length > 0 && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
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
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 hover:border-indigo-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {debt.person_name}
                  </span>
                  <span className="text-[9px] font-bold text-rose-500">
                    Jatuh Tempo
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {debt.title}
                </p>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-2">
                  Rp {(debt.total_amount - debt.paid_amount).toLocaleString('id-ID')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mini Spending Breakdown */}
      {categoryExpensesMonth.length > 0 && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Pengeluaran Terbesar Bulan Ini
            </h2>
            <Link href="/analitik" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              Detail <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {categoryExpensesMonth.slice(0, 3).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.category}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Rp {cat.amount.toLocaleString('id-ID')} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
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
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-cyan-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Target Tabungan
              </h2>
            </div>
            <Link href="/analitik" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {savingsGoals.slice(0, 2).map((goal) => {
              const pct = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
              return (
                <div key={goal.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {goal.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => openDepositModal(goal)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      + Nabung
                    </button>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      Rp {goal.current_amount.toLocaleString('id-ID')} / Rp {goal.target_amount.toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%`, backgroundColor: goal.color || '#10b981' }}
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
          <Link href="/transaksi" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
            Semua ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">Belum ada transaksi tercatat untuk akun ini.</p>
            <button
              onClick={() => openManualModal('expense')}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs"
            >
              Mulai Catat Transaksi
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: tx.category_color || '#3B82F6' }}
                  >
                    <CategoryIcon name={tx.category_icon || 'Wallet'} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {tx.note || tx.category}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{tx.account_name}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`text-xs font-black block ${
                      tx.type === 'expense'
                        ? 'text-rose-500'
                        : tx.type === 'income'
                        ? 'text-emerald-500'
                        : 'text-indigo-500'
                    }`}>
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                      Rp {tx.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] uppercase font-semibold text-slate-400">
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
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={modalType}
      />

      {/* Savings Goal Deposit Modal */}
      <SavingsGoalModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
        goalToEdit={selectedGoalForModal}
        mode={savingsModalMode}
      />

      {/* Transfer Saldo Modal */}
      <TransferSaldoModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      {/* Google Drive Backup Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />

    </div>
  );
}
