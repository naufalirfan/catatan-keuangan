import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Kebijakan Privasi - KashFolio',
  description: 'Kebijakan Privasi aplikasi KashFolio: Catatan Keuangan oleh Naufal.',
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
          <p className="text-sm text-slate-400 mt-2">
            Aplikasi: <strong>KashFolio: Catatan Keuangan</strong> | Developer: <strong>Naufal</strong>
          </p>
          <p className="text-xs text-slate-500">Terakhir diperbarui: 14 September 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">1. Pendahuluan</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Selamat datang di <strong>KashFolio: Catatan Keuangan</strong> (&quot;kami&quot;, &quot;aplikasi&quot;). Kami sangat menghargai privasi data finansial pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan aplikasi mobile maupun web kami.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">2. Data yang Kami Kumpulkan</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 pl-2">
            <li><strong>Informasi Akun:</strong> Saat Anda login menggunakan Google Sign-In (OAuth), kami menerima nama, alamat email, dan foto profil Anda semata-mata untuk keperluan autentikasi akun.</li>
            <li><strong>Data Keuangan Pengguna:</strong> Data transaksi keuangan (nominal, kategori, catatan pemasukan/pengeluaran, catatan hutang/piutang) yang Anda masukkan sendiri ke dalam aplikasi.</li>
            <li><strong>Mode Tamu (Guest Mode):</strong> Jika Anda menggunakan Mode Tamu tanpa login, seluruh data keuangan hanya disimpan secara lokal di penyimpanan perangkat Anda.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">3. Penggunaan dan Perlindungan Data</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Data Anda digunakan semata-mata untuk menyediakan fitur pencatatan dan analitik keuangan pribadi Anda.
          </p>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 pl-2">
            <li>Kami <strong>TIDAK PERNAH</strong> menjual, menyewakan, atau membagikan data keuangan Anda kepada pihak ketiga atau pengiklan.</li>
            <li>Aplikasi ini <strong>TIDAK</strong> mengandung iklan komersial dari pihak ketiga.</li>
            <li>Semua komunikasi data antara aplikasi dan basis data diamankan dengan enkripsi standar industri saat transit (HTTPS/SSL).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">4. Hak Pengguna & Penghapusan Data</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Anda memiliki kontrol penuh terhadap data Anda. Anda dapat menghapus data transaksi kapan saja dari menu aplikasi, atau mengajukan permohonan penghapusan akun permanen melalui halaman <Link href="/delete-data" className="text-emerald-400 underline">Penghapusan Data</Link> atau dengan menghubungi email <strong>naufalfaster@gmail.com</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">5. Kontak Pengembang</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, Anda dapat menghubungi kami melalui:
          </p>
          <p className="text-sm font-mono text-emerald-400">Email: naufalfaster@gmail.com</p>
        </section>
      </div>
    </div>
  );
}
