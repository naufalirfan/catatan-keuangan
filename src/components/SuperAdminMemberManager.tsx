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
  Sparkles,
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
    <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-8">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Superadmin Member Management</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                Khusus Owner
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Kelola status akun member PRO (5000/th) & FREE. Member yang request upgrade lewat Instagram (@naufal_irfansyah) dapat langsung diaktivasi di sini.
            </p>
          </div>
        </div>

        <a
          href="https://www.instagram.com/naufal_irfansyah"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          <span>DM Masuk: @naufal_irfansyah</span>
          <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
        </a>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5 relative z-10">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalMembers}</div>
            <div className="text-xs text-slate-400 font-medium">Total Member Terdaftar</div>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{proMembers}</div>
            <div className="text-xs text-amber-300/80 font-medium">Member PRO (5000/th) ⭐</div>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 text-slate-300 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-300">{freeMembers}</div>
            <div className="text-xs text-slate-400 font-medium">Member FREE</div>
          </div>
        </div>
      </div>

      {/* Quick Add / Update Member Form */}
      <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 mb-6 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Tambah atau Perbarui Status Member
          </h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Tarif PRO: 5000/th
          </span>
        </div>

        {successMsg && (
          <div className="mb-3 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveMember} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              placeholder="Email Google Member (cth: user@gmail.com)"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-3 relative">
            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Nama (opsional)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as UserPlan)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="pro">PRO (⭐ 5000/th)</option>
              <option value="free">FREE (Standar)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold rounded-lg text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Status'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Member List Table */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-slate-300">
            Daftar Member Terdata ({filteredMembers.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari email atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800 text-slate-400 text-sm">
            {members.length === 0
              ? 'Belum ada member yang login atau ditambahkan. Tambahkan email di atas untuk memberi akses PRO.'
              : 'Tidak ada member yang cocok dengan pencarian.'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status Saat Ini</th>
                  <th className="px-4 py-3 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredMembers.map((m) => {
                  const isPro = m.plan === 'pro';
                  return (
                    <tr key={m.email} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {m.picture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.picture}
                              alt={m.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-white">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{m.email}</td>
                      <td className="px-4 py-3">
                        {isPro ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40">
                            <Crown className="w-3 h-3 text-amber-400" />
                            PRO MEMBER ⭐
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            FREE
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTogglePlan(m.email, m.plan, m.name)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
                              isPro
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-sm'
                            }`}
                          >
                            {isPro ? (
                              <>
                                <UserX className="w-3 h-3" />
                                <span>Kembalikan Free</span>
                              </>
                            ) : (
                              <>
                                <Crown className="w-3 h-3" />
                                <span>Jadikan PRO ⭐</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(m.email)}
                            title="Hapus dari daftar"
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
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
