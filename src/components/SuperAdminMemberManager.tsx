'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { UserPlan } from '@/types/finance';
import {
  ShieldCheck,
  Crown,
  UserCheck,
  UserX,
  Search,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  ExternalLink,
  Mail,
  User as UserIcon,
} from 'lucide-react';

export default function SuperAdminMemberManager() {
  const { isSuperAdmin, members, updateMemberPlan, deleteMember } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // If not superadmin, do not render
  if (!isSuperAdmin) {
    return null;
  }

  const totalMembers = members.length;
  const proMembers = members.filter((m) => m.plan === 'pro').length;
  const freeMembers = members.filter((m) => m.plan === 'free').length;

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    return m.email.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
  });

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    try {
      await updateMemberPlan(emailInput.trim(), selectedPlan, nameInput.trim() || undefined);
      setSuccessMsg(`Status ${emailInput.trim()} berhasil diubah menjadi ${selectedPlan.toUpperCase()}!`);
      setEmailInput('');
      setNameInput('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePlan = async (email: string, currentPlan: UserPlan, name: string) => {
    const nextPlan: UserPlan = currentPlan === 'pro' ? 'free' : 'pro';
    await updateMemberPlan(email, nextPlan, name);
  };

  const handleDelete = async (email: string) => {
    if (confirm(`Hapus member ${email} dari daftar registry?`)) {
      await deleteMember(email);
    }
  };

  return (
    <div className="bg-white dark:bg-[#141720] border border-amber-500/30 rounded-2xl p-5 md:p-6 shadow-sm mb-6 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#232a3b] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Superadmin Member Management</h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                Owner
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola status akun member PRO & FREE. Aktivasi member yang request via Instagram langsung dari sini.
            </p>
          </div>
        </div>

        <a
          href="https://www.instagram.com/naufal_irfansyah"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1e2433] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-[#232a3b] transition"
        >
          <span>DM: @naufal_irfansyah</span>
          <ExternalLink className="w-3.5 h-3.5 text-pink-500" />
        </a>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        <div className="bg-slate-50 dark:bg-[#1e2433] border border-slate-200 dark:border-[#232a3b] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{totalMembers}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Member</div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#1e2433] border border-amber-500/30 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{proMembers}</div>
            <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">Member PRO</div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#1e2433] border border-slate-200 dark:border-[#232a3b] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">{freeMembers}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Member FREE</div>
          </div>
        </div>
      </div>

      {/* Quick Add / Update Member Form */}
      <div className="bg-slate-50 dark:bg-[#1e2433]/60 border border-slate-200 dark:border-[#232a3b] rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Tambah / Update Status Member
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            Tarif PRO: 5000/th
          </span>
        </div>

        {successMsg && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveMember} className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="md:col-span-5 relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              placeholder="Email Google Member"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-3 relative">
            <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Nama (opsional)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as UserPlan)}
              className="w-full bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="pro">PRO (5000/th)</option>
              <option value="free">FREE</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Member List Table */}
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-3">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Daftar Member Terdata ({filteredMembers.length})
          </h3>
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari email atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#232a3b] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 dark:bg-[#1e2433] rounded-xl border border-slate-200 dark:border-[#232a3b] text-slate-500 dark:text-slate-400 text-xs">
            {members.length === 0
              ? 'Belum ada member yang login atau ditambahkan.'
              : 'Tidak ada member yang cocok dengan pencarian.'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#232a3b] bg-white dark:bg-[#141720]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#1e2433] text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-[#232a3b] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-3.5 py-2.5">Member</th>
                  <th className="px-3.5 py-2.5">Email</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#232a3b] text-slate-700 dark:text-slate-200">
                {filteredMembers.map((m) => {
                  const isPro = m.plan === 'pro';
                  return (
                    <tr key={m.email} className="hover:bg-slate-50 dark:hover:bg-[#1e2433]/50 transition">
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          {m.picture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.picture}
                              alt={m.name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-[#232a3b]"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-teal-600/20 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-[9px]">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-slate-900 dark:text-white truncate max-w-[120px]">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">{m.email}</td>
                      <td className="px-3.5 py-2.5">
                        {isPro ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            <Crown className="w-3 h-3 text-amber-500" />
                            PRO
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            FREE
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTogglePlan(m.email, m.plan, m.name)}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                              isPro
                                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                            }`}
                          >
                            {isPro ? 'Ke Free' : 'Ke PRO'}
                          </button>

                          <button
                            onClick={() => handleDelete(m.email)}
                            title="Hapus"
                            className="p-1 text-slate-400 hover:text-rose-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}