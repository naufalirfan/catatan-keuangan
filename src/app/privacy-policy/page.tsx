import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - KashFolio: Catatan Keuangan',
  description: 'Kebijakan Privasi aplikasi KashFolio: Catatan Keuangan oleh Naufal Irfansyah Saputra.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl space-y-8">
        <div>
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium inline-flex items-center gap-1 mb-4">
            ← Kembali ke KashFolio
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <div className="mt-2 text-sm text-slate-400 space-y-1">
            <p>Aplikasi: <strong>KashFolio: Catatan Keuangan</strong></p>
            <p>ID Paket (Package Name): <code className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">com.naufal.catatankeuangan</code></p>
            <p>Pengembang (Developer): <strong>Naufal Irfansyah Saputra</strong></p>
            <p className="text-xs text-slate-500 pt-1">Terakhir diperbarui: 10 Oktober 2026</p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">1. Pendahuluan</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Selamat datang di <strong>KashFolio: Catatan Keuangan</strong> (&quot;kami&quot;, &quot;aplikasi&quot;). Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan aplikasi mobile Android maupun platform web kami. Kami berkomitmen penuh untuk menjaga privasi dan keamanan data finansial Anda.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">2. Data yang Kami Kumpulkan</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Kami hanya mengumpulkan data yang benar-benar dibutuhkan untuk menyediakan fungsionalitas pencatatan keuangan pribadi:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 pl-2">
            <li>
              <strong>Informasi Akun (Google Sign-In / OAuth):</strong> Saat Anda masuk menggunakan Google Sign-In, kami menerima informasi dasar berupa nama, alamat email, dan foto profil. Data ini digunakan semata-mata untuk mengautentikasi identitas akun dan sinkronisasi data antar-perangkat Anda.
            </li>
            <li>
              <strong>Data Transaksi Keuangan:</strong> Data transaksi (nominal uang, kategori pengeluaran/pemasukan, tanggal, catatan deskripsi, serta catatan hutang/piutang) yang Anda inputkan secara manual atau diproses secara lokal melalui bantuan AI.
            </li>
            <li>
              <strong>Mode Tamu (Guest Mode):</strong> Apabila Anda memilih masuk sebagai tamu (Mode Demo), seluruh data disimpan 100% secara lokal di perangkat Anda tanpa diunggah ke server cloud kami.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">3. Penggunaan dan Perlindungan Data</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Data Anda digunakan hanya untuk fungsionalitas internal aplikasi KashFolio:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 pl-2">
            <li>Kami <strong>TIDAK PERNAH</strong> menjual, menyewakan, mentransfer, atau membagikan data pribadi maupun finansial Anda kepada pihak ketiga atau jaringan periklanan.</li>
            <li>Aplikasi ini <strong>BEBAS DARI IKLAN</strong> komersial pihak ketiga.</li>
            <li>Semua komunikasi data antara aplikasi dan basis data (Supabase) dilindungi menggunakan enkripsi standar industri HTTPS / TLS (SSL).</li>
            <li>Data setiap pengguna terisolasi secara ketat menggunakan Row-Level Security (RLS) sehingga hanya Anda yang dapat mengakses data Anda.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">4. Hak Pengguna & Penghapusan Data (Data Deletion)</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Anda memiliki kontrol penuh atas seluruh data pribadi Anda:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 pl-2">
            <li>Anda dapat menghapus atau mereset transaksi kapan saja langsung dari menu <strong>Pengaturan &gt; Hapus / Reset Data</strong> di dalam aplikasi.</li>
            <li>Anda dapat mengajukan permohonan penghapusan akun dan seluruh data terkait secara permanen melalui halaman panduan kami di <Link href="/delete-data" className="text-emerald-400 underline font-medium">Halaman Penghapusan Data</Link> atau dengan mengirimkan email ke <strong className="text-emerald-400">naufalfaster@gmail.com</strong>. Data Anda akan dihapus secara menyeluruh dari server dalam waktu maksimal 7 hari kerja.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">5. Privasi Anak-Anak (Children&apos;s Privacy)</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Aplikasi ini tidak ditujukan untuk anak-anak di bawah usia 13 tahun, dan kami tidak dengan sengaja mengumpulkan data identitas pribadi dari anak-anak di bawah umur.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">6. Kontak Pengembang (Developer Contact)</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Jika Anda memiliki pertanyaan, keluhan, atau saran terkait kebijakan privasi ini atau pengelolaan data di KashFolio, Anda dapat menghubungi kami secara langsung melalui:
          </p>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-1 text-sm">
            <p><strong>Pengembang:</strong> Naufal Irfansyah Saputra</p>
            <p><strong>Email:</strong> <a href="mailto:naufalfaster@gmail.com" className="text-emerald-400 font-mono hover:underline">naufalfaster@gmail.com</a></p>
            <p><strong>Aplikasi:</strong> KashFolio: Catatan Keuangan (com.naufal.catatankeuangan)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
