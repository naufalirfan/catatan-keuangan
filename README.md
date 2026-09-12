# DompetKu AI • Catatan Keuangan Mobile-Friendly

Aplikasi pencatatan keuangan cerdas (*Personal Finance & Expense Tracker*) berdesain **mobile-first**, dilengkapi input otomatis dengan **Gemini AI & Custom Endpoint Token**, autentikasi **Google OAuth**, manajemen multi-dompet, mode **Pro & Free**, dan sinkronisasi **Supabase Cloud**.

Dibuat khusus untuk **Naufal Irfansyah Saputra**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000?style=for-the-badge&logo=vercel)](https://catatan-keuangan-phi.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/naufalirfan/catatan-keuangan)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📱 Tampilan Antarmuka Aplikasi

<div align="center">
  <img src="docs/screenshot.png" alt="Tampilan Antarmuka DompetKu AI" width="100%" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);" />
</div>

---

## 🌐 Tautan Live Aplikasi

- 🚀 **Aplikasi Live di Vercel**: [https://catatan-keuangan-phi.vercel.app](https://catatan-keuangan-phi.vercel.app)
- 📦 **GitHub Repository**: [https://github.com/naufalirfan/catatan-keuangan](https://github.com/naufalirfan/catatan-keuangan)

---

## ✨ Fitur Utama

- 📱 **Mobile-First Experience**: Tampilan responsif dengan *Bottom Navigation Bar*, kartu saldo interaktif, dan navigasi ergonomis layaknya aplikasi native.
- 🌓 **Mode Terang & Gelap (Dark / Light Mode)**: Pengalihan tema instan yang nyaman di mata dengan penyimpanan preferensi otomatis.
- 🔒 **1 Akun 1 Catatan (Isolasi Data Penuh)**: Penyimpanan transaksi, rekening, dan kategori terpisah secara eksklusif berdasarkan User ID (data aman & tidak tertukar).
- 👑 **Mode PRO & FREE**:
  - Pilihan paket saat pertama kali login.
  - Sakelar langsung di dashboard untuk beralih mode.
  - Akun **Superadmin (`naufalfaster@gmail.com`)** memiliki kontrol penuh atas pengaturan AI API Key & konfigurasi sistem.
- ⚡ **Input Manual Cepat**: Tambah transaksi (Pengeluaran, Pemasukan, Transfer Antar Rekening) dalam hitungan detik dengan tombol nominal cepat (+10rb, +20rb, +50rb, +100rb, +500rb, +1jt).
- 🧠 **Input Cerdas Berbasis AI**:
  - **Natural Language Parsing**: Cukup ketik santai atau dikte suara: *"Beli sate ayam 35rb bayar pake gopay"* atau *"Gajian kantor 8.5jt masuk BCA"*.
  - **Scan Struk Belanja**: Unggah foto struk/nota belanja untuk diekstrak total belanja dan itemnya secara otomatis.
  - **Pengaturan Khusus Superadmin**: Pengaturan Gemini API Key, Custom Endpoint, dan Bearer Token hanya bisa diakses oleh Superadmin, sementara member langsung menikmati AI tanpa repot.
- 🔐 **Google OAuth Login**: Terhubung via Google Identity Services (GIS) & Supabase OAuth, plus akun cepat Admin & Tamu demo.
- 💳 **Multi-Dompet & Rekening**: Pantau saldo BCA, Mandiri, Cash, GoPay, OVO, ShopeePay, DANA, dan instrumen investasi secara terpisah.
- 📊 **Analitik & Evaluasi Anggaran**: Donut chart kategori pengeluaran, progress bar batas anggaran bulanan, dan indikator rasio tabungan (*Savings Rate*).
- 💾 **Data Aman & Ekspor**: Mode offline-first dengan LocalStorage, sinkronisasi Supabase Cloud, dan fitur ekspor ke **Excel / CSV** serta cadangan **JSON**.

---

## 🛠️ Menjalankan di Lokal

1. Masuk ke folder proyek:
   ```bash
   cd "d:\Naufal\AI\catatan-keuangan"
   ```

2. Pasang dependensi (jika belum):
   ```bash
   npm install
   ```

3. Jalankan development server:
   ```bash
   npm run dev
   ```

4. Buka di browser:
   [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy ke Vercel & GitHub

Proyek ini telah dikonfigurasi untuk langsung di-deploy ke GitHub (`naufalirfan`) dan Vercel (`naufalfaster-3813`).

Variabel lingkungan yang diperlukan:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GEMINI_API_KEY` (opsional, dikonfigurasi oleh Superadmin)

---

© 2026 **Naufal Irfansyah Saputra** • DompetKu AI
