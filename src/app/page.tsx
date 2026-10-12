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
  Coins,
  CheckCircle2
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
  const [showAdminMemberManager, setShowAdminMemberManager] = useState(false);

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
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {currentDateFormatted}
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            Halo, {user?.name?.split(' ')[0] || 'Kawan'} <span>👋</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Dashboard Plan Switcher Badge */}
          <button
            onClick={() => setShowPlanModal(true)}
            title="Klik untuk ubah paket Free / Pro"
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

      {/* Hero Financial Card (Nordic Mint Neobank Midnight Anchor) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0b1329] p-6 text-white shadow-xl border border-slate-800/80 space-y-4">
        
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Total Saldo Bersih
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight mt-1 tabular-nums">
              {isBalanceHidden ? 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢' : `Rp ${totalBalance.toLocaleString('id-ID')}`}
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black uppercase tracking-wider">
            {accounts.length} Akun Aktif
          </span>
        </div>

        {/* Income vs Expense Pills */}
        <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">Pemasukan Bulan Ini</span>
              <span className="text-sm font-extrabold text-emerald-400 tabular-nums">
                {isBalanceHidden ? 'â€¢â€¢â€¢â€¢â€¢â€¢' : `+Rp ${totalIncomeMonth.toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">Pengeluaran Bulan Ini</span>
              <span className="text-sm font-extrabold text-rose-400 tabular-nums">
                {isBalanceHidden ? 'â€¢â€¢â€¢â€¢â€¢â€¢' : `-Rp ${totalExpenseMonth.toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Net Cash Flow Indicator Bar */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
          <span className="text-slate-400 font-medium">Arus Kas Bersih:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] tabular-nums ${
            netCashFlowMonth >= 0 
              ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' 
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {netCashFlowMonth >= 0 ? '+' : ''}
            {isBalanceHidden ? 'â€¢â€¢â€¢â€¢â€¢â€¢' : `Rp ${netCashFlowMonth.toLocaleString('id-ID')}`}
          </span>
        </div>

      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button
          onClick={() => openManualModal('expense')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-emerald-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Manual
          </span>
        </button>

        <Link
          href="/ai-input"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-emerald-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 group-hover:scale-110 transition-transform font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Scan AI
          </span>
        </Link>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-sky-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Transfer
          </span>
        </button>

        <Link
          href="/rekening"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-blue-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Rekening
          </span>
        </Link>

        <Link
          href="/hutang"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-indigo-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Hutang
          </span>
        </Link>

        <button
          onClick={() => setIsDriveModalOpen(true)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-cyan-500 transition-all active:scale-95 group"
        >
          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
            <Cloud className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            G-Drive
          </span>
        </button>
      </div>

      {/* Modular Account Cards Carousel */}
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
            Kelola ({accounts.length})
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {accounts.map((acc) => {
            const isBca = acc.name.toLowerCase().includes('bca');
            const isMandiri = acc.name.toLowerCase().includes('mandiri');
            
            const cardBg = isBca 
              ? 'bg-blue-50/70 dark:bg-[#121826] border-blue-200/80 dark:border-slate-800' 
              : isMandiri 
              ? 'bg-amber-50/70 dark:bg-[#121826] border-amber-200/80 dark:border-slate-800'
              : 'bg-emerald-50/70 dark:bg-[#121826] border-emerald-200/80 dark:border-slate-800';

            return (
              <Link
                key={acc.id}
                href="/rekening"
                className={`min-w-[170px] snap-start p-4 rounded-2xl border shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform ${cardBg}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ backgroundColor: acc.color }}
                  >
                    <CategoryIcon name={acc.icon} className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                    {acc.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-300 truncate">
                    {acc.name}
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 tabular-nums">
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
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-400 transition-colors"
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

      {/* Pengeluaran Terbesar Bulan Ini */}
      {categoryExpensesMonth.length > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Pengeluaran Terbesar Bulan Ini
            </h2>
            <Link href="/analitik" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              Detail <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {categoryExpensesMonth.slice(0, 3).map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.category}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                    Rp {cat.amount.toLocaleString('id-ID')} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                <div key={goal.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
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

      {/* Recent Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Transaksi Terkini
          </h2>
          <Link href="/transaksi" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
            Semua ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400">Belum ada transaksi tercatat untuk akun ini.</p>
            <button
              onClick={() => openManualModal('expense')}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-sm"
            >
              Mulai Catat Transaksi
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
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
                      <span>•</span>
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

      {/* Superadmin Collapsible Management Widget */}
      {isSuperAdmin && (
        <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-[#121826] p-4.5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Superadmin Panel ({user?.email || 'Owner'})
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Simulasi aktif: <strong className="uppercase font-bold text-emerald-600 dark:text-emerald-400">{userPlan}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserPlan(userPlan === 'pro' ? 'free' : 'pro')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Switch: {userPlan === 'pro' ? 'FREE' : 'PRO'}
              </button>
              <button
                onClick={() => setShowAdminMemberManager(!showAdminMemberManager)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] transition-colors shadow-sm"
              >
                {showAdminMemberManager ? 'Tutup Panel' : 'Kelola Member'}
              </button>
            </div>
          </div>

          {showAdminMemberManager && (
            <div className="pt-2">
              <SuperAdminMemberManager />
            </div>
          )}
        </div>
      )}

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