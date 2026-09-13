'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFinance } from '@/context/FinanceContext';
import { DebtRecord, DebtType } from '@/types/finance';
import { 
  ArrowLeft, 
  Plus, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  X, 
  Coins, 
  CreditCard,
  Crown
} from 'lucide-react';

export default function HutangPage() {
  const { 
    debts, 
    addDebt, 
    updateDebt, 
    deleteDebt, 
    recordDebtPayment, 
    userPlan, 
    isSuperAdmin, 
    setShowPlanModal,
    accounts 
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtRecord | null>(null);

  // Form State for Add/Edit
  const [personName, setPersonName] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DebtType>('debt');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [dueDate, setDueDate] = useState('2026-08-01 12:00');
  const [note, setNote] = useState('');

  // Form State for Installment
  const [payAmount, setPayAmount] = useState('');

  const filteredDebts = debts.filter((d) => d.status === activeTab);

  const openAddModal = () => {
    const activeUnpaidCount = debts.filter((d) => d.status === 'unpaid').length;
    if (userPlan === 'free' && !isSuperAdmin && activeUnpaidCount >= 3) {
      setShowPlanModal(true);
      return;
    }
    setPersonName('');
    setTitle('');
    setType('debt');
    setTotalAmount('');
    setPaidAmount('0');
    setDueDate(new Date().toISOString().slice(0, 16).replace('T', ' '));
    setNote('');
    setIsAddModalOpen(true);
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const numTotal = parseInt(totalAmount.replace(/\D/g, '') || '0', 10);
    const numPaid = parseInt(paidAmount.replace(/\D/g, '') || '0', 10);
    if (!personName.trim() || !numTotal) return;

    addDebt({
      person_name: personName,
      title: title || 'Keperluan Lainnya',
      type,
      total_amount: numTotal,
      paid_amount: numPaid,
      due_date: dueDate,
      status: numPaid >= numTotal ? 'paid' : 'unpaid',
      note,
    });

    setIsAddModalOpen(false);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) return;
    const numPay = parseInt(payAmount.replace(/\D/g, '') || '0', 10);
    if (!numPay || numPay <= 0) return;

    recordDebtPayment(selectedDebt.id, numPay);
    setIsPayModalOpen(false);
    setPayAmount('');
    setSelectedDebt(null);
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-5 min-h-screen pb-24 relative">
      
      {/* App Bar Matching Screenshot 8 & 9 */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold text-slate-900 dark:text-white">
          Hutang
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Segmented Switch: BELUM LUNAS vs LUNAS */}
      <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-4 font-bold text-xs">
        <button
          onClick={() => setActiveTab('unpaid')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'unpaid'
              ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          BELUM LUNAS
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'paid'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          LUNAS
        </button>
      </div>

      {/* Free Plan Limit Notice */}
      {userPlan === 'free' && !isSuperAdmin && (
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-amber-300/60 dark:border-amber-700/60 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Akun Free ({debts.filter(d => d.status === 'unpaid').length}/3 Catatan Aktif)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Upgrade ke PRO untuk mencatat hutang tanpa batas
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

      {/* Debt Cards List Matching Screenshot 8 & 9 */}
      {filteredDebts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-500">
            Tidak ada catatan hutang pada tab ini.
          </p>
          <button
            onClick={openAddModal}
            className="text-xs text-sky-600 dark:text-sky-400 font-bold underline"
          >
            + Buat Catatan Hutang Baru
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDebts.map((item) => {
            const percent = Math.min(100, Math.round((item.paid_amount / item.total_amount) * 100));
            const remaining = Math.max(0, item.total_amount - item.paid_amount);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Card Top: Avatar + Person Name + Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.person_name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  {item.status === 'unpaid' ? (
                    <span className="text-[11px] font-bold text-rose-500">
                      Jatuh Tempo
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lunas
                    </span>
                  )}
                </div>

                {/* Progress Bar & Subtotals */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">
                      Terbayar <br />
                      <strong className="text-slate-900 dark:text-white text-xs">
                        {item.paid_amount.toLocaleString('id-ID')}
                      </strong>
                    </span>
                    <span className="text-right text-slate-500">
                      Total <br />
                      <strong className="text-slate-900 dark:text-white text-xs">
                        {item.total_amount.toLocaleString('id-ID')}
                      </strong>
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Card Bottom: Due Date & Remaining */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="block text-[9px] uppercase text-slate-400">Jatuh Tempo</span>
                    <span className="text-slate-700 dark:text-slate-300">{item.due_date}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase text-slate-400">Belum Lunas</span>
                    <span className="text-slate-900 dark:text-white font-bold text-xs">
                      {remaining.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {item.status === 'unpaid' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedDebt(item);
                          setIsPayModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Cicil / Bayar
                      </button>
                      <button
                        onClick={() => updateDebt(item.id, { paid_amount: item.total_amount, status: 'paid' })}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors"
                      >
                        Tandai Lunas
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Hapus catatan hutang ${item.person_name}?`)) {
                        deleteDebt(item.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (+) Matching Screenshot */}
      <button
        onClick={openAddModal}
        title="Tambah Hutang"
        className="fixed bottom-20 right-6 md:right-auto md:left-1/2 md:translate-x-52 w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white flex items-center justify-center shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Add Debt */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Tambah Catatan Hutang
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDebt} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Nama Orang / Kontak
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Contoh: Edward, Andreas Dimz"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Keperluan / Judul
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: jajanan & minuman, Beli HP"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Total Hutang (Rp)
                  </label>
                  <input
                    type="text"
                    value={totalAmount ? parseInt(totalAmount.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="54.000"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Sudah Terbayar (Rp)
                  </label>
                  <input
                    type="text"
                    value={paidAmount ? parseInt(paidAmount.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : '0'}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="10.000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Jatuh Tempo (Tanggal & Waktu)
                </label>
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="2026-08-01 12:40"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black uppercase tracking-wider text-xs shadow-md shadow-sky-500/20"
              >
                Simpan Catatan Hutang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pay Installment */}
      {isPayModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Catat Pembayaran / Cicilan
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Membayar untuk: <strong className="text-slate-900 dark:text-white">{selectedDebt.person_name}</strong> ({selectedDebt.title}).
              <br />
              Sisa belum lunas: <strong className="text-rose-500 font-bold">Rp {(selectedDebt.total_amount - selectedDebt.paid_amount).toLocaleString('id-ID')}</strong>
            </p>

            <form onSubmit={handlePaySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Nominal Pembayaran (Rp)
                </label>
                <input
                  type="text"
                  value={payAmount ? parseInt(payAmount.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Contoh: 25.000"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase tracking-wider text-xs shadow-md shadow-emerald-500/20"
              >
                Simpan Pembayaran
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
