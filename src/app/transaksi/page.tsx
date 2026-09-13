'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import CategoryIcon from '@/components/CategoryIcon';
import TransactionModal from '@/components/TransactionModal';
import TransactionDetailModal from '@/components/TransactionDetailModal';
import { Transaction, TransactionType } from '@/types/finance';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Trash2, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ArrowRightLeft,
  X,
  FileSpreadsheet,
  GitFork
} from 'lucide-react';

export default function TransaksiPage() {
  const { 
    filteredTransactions, 
    filterPeriod, 
    setFilterPeriod, 
    filterType, 
    setFilterType, 
    filterCategory, 
    setFilterCategory, 
    filterAccount, 
    setFilterAccount, 
    searchQuery, 
    setSearchQuery, 
    categories, 
    accounts, 
    deleteTransaction,
    exportToCsv,
    exportToExcel
  } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce<Record<string, typeof filteredTransactions>>((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});

  const formatHeaderDate = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) return 'Hari Ini';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
      }
    } catch {}
    return dateStr;
  };

  const formatCompactCurrency = (amount: number) => {
    const abs = Math.abs(amount);
    if (abs >= 1000000) {
      return `${amount > 0 ? '+' : '-'}Rp ${(abs / 1000000).toFixed(1).replace('.0', '')}M`;
    }
    if (abs >= 1000) {
      return `${amount > 0 ? '+' : '-'}Rp ${(abs / 1000).toFixed(0)}K`;
    }
    return `${amount > 0 ? '+' : '-'}Rp ${abs.toLocaleString('id-ID')}`;
  };

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-5 space-y-4">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-xs text-slate-400">
            {filteredTransactions.length} transaksi ditemukan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Excel (.xlsx) PRO Export Button */}
          <button
            onClick={exportToExcel}
            title="Download Laporan Excel (.xlsx) Khusus Akun PRO"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-amber-500/15 hover:from-emerald-500/25 hover:to-amber-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Excel (.xlsx)</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-slate-950">PRO</span>
          </button>

          <button
            onClick={exportToCsv}
            title="Download CSV Biasa"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3 h-3 text-slate-400" />
            <span className="hidden xs:inline">CSV</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi, toko, atau catatan..."
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-2xl border transition-colors ${
              showFilters || filterCategory !== 'all' || filterAccount !== 'all'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Period Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: 'Bulan Ini', value: 'this_month' },
            { label: 'Minggu Ini', value: 'this_week' },
            { label: 'Hari Ini', value: 'today' },
            { label: 'Semua', value: 'all' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setFilterPeriod(p.value as typeof filterPeriod)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterPeriod === p.value
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Type Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl text-xs font-semibold">
          {[
            { label: 'Semua', value: 'all' },
            { label: 'Pengeluaran', value: 'expense' },
            { label: 'Pemasukan', value: 'income' },
            { label: 'Transfer', value: 'transfer' },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value as typeof filterType)}
              className={`py-1.5 rounded-xl transition-all ${
                filterType === t.value
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Extended Filters (Category & Account) */}
        {showFilters && (
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-2 gap-2 animate-in fade-in duration-150">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Kategori
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Rekening / Dompet
              </label>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Rekening</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Filter Summary Banner */}
      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <ArrowDownCircle className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-rose-500">
            -Rp {totalFilteredExpense.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-emerald-500">
            +Rp {totalFilteredIncome.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Grouped Transaction List */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-500">
            Tidak ada transaksi yang cocok dengan filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterPeriod('all');
              setFilterType('all');
              setFilterCategory('all');
              setFilterAccount('all');
            }}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-bold underline"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([dateStr, items]) => {
            const netDay = items.reduce((sum, tx) => {
              if (tx.type === 'income') return sum + tx.amount;
              if (tx.type === 'expense') return sum - tx.amount;
              return sum;
            }, 0);

            return (
              <div key={dateStr} className="space-y-1.5">
                {/* Date Header with Daily Net Amount (Screenshot 4) */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatHeaderDate(dateStr)}
                  </span>
                  <span className={`text-[11px] font-bold ${
                    netDay > 0 
                      ? 'text-emerald-500' 
                      : netDay < 0 
                      ? 'text-rose-500' 
                      : 'text-slate-400'
                  }`}>
                    {formatCompactCurrency(netDay)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {items.map((tx) => {
                    const isSplit = Array.isArray(tx.splits) && tx.splits.length > 0;

                    return (
                      <div
                        key={tx.id}
                        onClick={() => {
                          setSelectedTx(tx);
                          setIsDetailOpen(true);
                        }}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                              isSplit ? 'bg-emerald-500' : ''
                            }`}
                            style={!isSplit ? { backgroundColor: tx.category_color || '#3B82F6' } : {}}
                          >
                            {isSplit ? (
                              <GitFork className="w-5 h-5 text-white" />
                            ) : (
                              <CategoryIcon name={tx.category_icon || 'Wallet'} className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {isSplit ? `${tx.splits!.length} kategori` : (tx.note || tx.category)}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>
                                {tx.type === 'transfer'
                                  ? `${tx.account_name} ➔ ${tx.to_account_name || 'Rekening'}`
                                  : tx.account_name}
                              </span>
                              {tx.time && (
                                <>
                                  <span>•</span>
                                  <span>{tx.time}</span>
                                </>
                              )}
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
                              {isSplit ? `${tx.splits!.length} kategori` : tx.category}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
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
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (+) Matching Screenshot 4 */}
      <button
        onClick={() => setModalOpen(true)}
        title="Catat Transaksi"
        className="fixed bottom-20 right-6 md:right-auto md:left-1/2 md:translate-x-52 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Manual Add Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Detail Transaksi Modal (Screenshot 3) */}
      <TransactionDetailModal
        isOpen={isDetailOpen}
        transaction={selectedTx}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTx(null);
        }}
      />

    </div>
  );
}
