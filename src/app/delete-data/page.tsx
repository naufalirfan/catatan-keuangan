import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Penghapusan Data Pengguna - KashFolio',
  description: 'Kebijakan dan panduan permohonan penghapusan akun serta data pengguna KashFolio: Catatan Keuangan.',
};

export default function DeleteDataPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl space-y-8">
        <div>
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium inline-flex items-center gap-1 mb-4">
            ← Kembali ke KashFolio
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Permohonan Penghapusan Akun & Data (Data Deletion Request)
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Aplikasi: <strong>KashFolio: Catatan Keuangan</strong> | Developer: <strong>Naufal</strong>
          </p>
          <p className="text-xs text-slate-500">Terakhir diperbarui: 14 September 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">1. Komitmen Privasi & Kendali Data</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            KashFolio menghormati privasi dan hak kepemilikan data Anda. Anda memiliki hak penuh untuk meminta penghapusan akun beserta seluruh riwayat keuangan yang tersimpan di server kami kapan saja tanpa biaya.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">2. Cara Menghapus Data Langsung dari Aplikasi</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Anda dapat menghapus data Anda secara instan langsung dari dalam aplikasi KashFolio:
          </p>
          <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1.5 pl-2">
            <li>Buka aplikasi <strong>KashFolio</strong> di perangkat Android Anda.</li>
            <li>Buka menu <strong>Pengaturan</strong> (Settings).</li>
            <li>Pilih opsi <strong>Hapus / Reset Data</strong> untuk menghapus transaksi lokal maupun cloud.</li>
            <li>Anda juga dapat melakukan <strong>Keluar / Log Out</strong> kapan saja.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">3. Cara Mengajukan Permintaan Penghapusan Permanen via Email</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Jika Anda ingin menghapus seluruh profil akun Google OAuth dan semua basis data terkait dari server kami secara permanen:
          </p>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2 text-sm text-slate-300">
            <p>Kirimkan email ke alamat pengembang resmi kami:</p>
            <p className="font-mono text-emerald-300 font-semibold">naufalfaster@gmail.com</p>
            <p><strong>Subjek Email:</strong> Permintaan Penghapusan Data KashFolio - [Email Terdaftar]</p>
            <p><strong>Isi Pesan:</strong> Sertakan nama akun dan alamat email Google yang Anda gunakan untuk masuk ke aplikasi KashFolio.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">4. Jenis Data yang Dihapus dan Retensi</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 pl-2">
            <li><strong>Data yang dihapus:</strong> Seluruh catatan transaksi (pemasukan, pengeluaran, hutang/piutang), kategori kustom, preferensi akun, dan data autentikasi.</li>
            <li><strong>Data yang disimpan:</strong> Tidak ada data pribadi yang disimpan setelah proses penghapusan selesai.</li>
            <li><strong>Waktu Pemrosesan:</strong> Permintaan penghapusan melalui email akan diselesaikan selambat-lambatnya dalam waktu <strong>7 hari kerja</strong>.</li>
          </ul>
        </section>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          Untuk informasi lebih lengkap mengenai pengolahan data, silakan baca <Link href="/privacy-policy" className="text-emerald-400 underline">Kebijakan Privasi KashFolio</Link>.
        </div>
      </div>
    </div>
  );
}
