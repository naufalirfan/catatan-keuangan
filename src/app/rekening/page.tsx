'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFinance } from '@/context/FinanceContext';
import TransferSaldoModal from '@/components/TransferSaldoModal';
import { Account, AccountType } from '@/types/finance';
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  Plus, 
  ChevronRight, 
  Wallet, 
  Landmark, 
  Smartphone, 
  Banknote, 
  TrendingUp, 
  CreditCard,
  Trash2,
  Edit2,
  X,
  Crown
} from 'lucide-react';

export default function RekeningPage() {
  const { 
    accounts, 
    totalBalance, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    userPlan, 
    isSuperAdmin, 
    setShowPlanModal 
  } = useFinance();

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#0060AF');

  const openAddModal = () => {
    if (userPlan === 'free' && !isSuperAdmin && accounts.length >= 2) {
      setShowPlanModal(true);
      return;
    }
    setEditingAccount(null);
    setName('');
    setType('bank');
    setBalance('');
    setColor('#0060AF');
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance.toString());
    setColor(acc.color);
    setIsAddEditModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseInt(balance.replace(/\D/g, '') || '0', 10);
    if (!name.trim()) return;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name,
        type,
        balance: numBalance,
        color,
      });
    } else {
      addAccount({
        name,
        type,
        balance: numBalance,
        color,
        icon: type === 'bank' ? 'Landmark' : type === 'cash' ? 'Banknote' : 'Smartphone',
      });
    }
    setIsAddEditModalOpen(false);
  };

  const getAccountIcon = (accType: AccountType) => {
    switch (accType) {
      case 'bank':
        return Landmark;
      case 'cash':
        return Banknote;
      case 'investment':
        return TrendingUp;
      case 'ewallet':
      default:
        return Smartphone;
    }
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-5 min-h-screen pb-24 relative">
      
      {/* App Bar Matching Screenshot 6 */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold text-slate-900 dark:text-white">
          Rekening
        </h1>
        <button
          onClick={() => setIsTransferOpen(true)}
          title="Transfer Saldo Antar Rekening"
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors shadow-xs"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Free Plan Limit Notice */}
      {userPlan === 'free' && !isSuperAdmin && (
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-300/60 dark:border-amber-700/60 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Akun Free ({accounts.length}/2 Rekening)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Upgrade ke PRO untuk menambah rekening tanpa batas
            </p>
          </div>
          <button
            onClick={() => setShowPlanModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[11px] font-black uppercase shadow-xs flex items-center gap-1"
          >
            <Crown className="w-3 h-3" />
            PRO
          </button>
        </div>
      )}

      {/* Total Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400">
            Total Saldo
          </p>
          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Rp {totalBalance.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {accounts.map((acc) => {
          const IconComponent = getAccountIcon(acc.type);
          return (
            <div
              key={acc.id}
              onClick={() => openEditModal(acc)}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: acc.color || '#0060AF' }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {acc.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">
                    {acc.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    Rp {acc.balance.toLocaleString('id-ID')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button (+) Matching Screenshot */}
      <button
        onClick={openAddModal}
        title="Tambah Rekening"
        className="fixed bottom-20 right-6 md:right-auto md:left-1/2 md:translate-x-52 w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white flex items-center justify-center shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Transfer Saldo Modal */}
      <TransferSaldoModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />

      {/* Add / Edit Account Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {editingAccount ? 'Edit Rekening' : 'Tambah Rekening'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Nama Rekening / Dompet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: BCA, Dompet Tunai, OVO, DANA"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Tipe Akun
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="bank">Bank (BCA, Mandiri, BRI, BNI)</option>
                  <option value="ewallet">E-Wallet (GoPay, OVO, DANA, ShopeePay)</option>
                  <option value="cash">Uang Tunai (Dompet)</option>
                  <option value="investment">Investasi (Bibit, Saham, Reksa Dana)</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Saldo Awal (Rp)
                </label>
                <input
                  type="text"
                  value={balance ? parseInt(balance.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Warna Tema
                </label>
                <div className="flex items-center gap-2">
                  {['#0060AF', '#10B981', '#4C3494', '#00AED6', '#EE4D2D', '#059669', '#6366F1'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-xl transition-transform ${color === c ? 'scale-115 ring-2 ring-offset-2 ring-slate-400' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                {editingAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus rekening ${editingAccount.name}?`)) {
                        deleteAccount(editingAccount.id);
                        setIsAddEditModalOpen(false);
                      }
                    }}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black uppercase tracking-wider text-xs shadow-md shadow-sky-500/20"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
