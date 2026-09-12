# DompetKu AI • Catatan Keuangan Mobile-Friendly

Aplikasi pencatatan keuangan cerdas (*Personal Finance & Expense Tracker*) berdesain **mobile-first**, dilengkapi input otomatis dengan **Gemini AI & Custom Endpoint Token**, autentikasi **Google OAuth**, manajemen multi-dompet, analitik visual, dan sinkronisasi **Supabase Cloud**.

Dibuat khusus untuk **Naufal Irfansyah Saputra**.

---

## Fitur Utama

- 📱 **Mobile-First Experience**: Tampilan responsif dengan Bottom Navigation Bar, kartu saldo interaktif, dan navigasi ergonomis layaknya aplikasi native.
- ⚡ **Input Manual Cepat**: Tambah transaksi (Pengeluaran, Pemasukan, Transfer Antar Rekening) dalam hitungan detik dengan tombol nominal cepat (+10rb, +20rb, +50rb, +100rb, +500rb, +1jt).
- 🧠 **Input Cerdas Berbasis AI**:
  - **Natural Language Parsing**: Cukup ketik santai atau dikte suara: *"Beli sate ayam 35rb bayar pake gopay"* atau *"Gajian kantor 8.5jt masuk BCA"*.
  - **Google Gemini Official**: Menggunakan model `gemini-1.5-flash` atau `gemini-2.0-flash`.
  - **Custom Endpoint & Custom Token**: Fleksibel dihubungkan ke proxy internal, OpenRouter, Groq, atau server LLM lokal.
  - **Scan Struk Belanja (Vision)**: Unggah foto struk/nota belanja untuk diekstrak total belanja dan itemnya secara otomatis.
- 🔐 **Google OAuth Login**: Terhubung via Google Identity Services & Supabase OAuth, plus akun cepat Admin & Tamu demo.
- 💳 **Multi-Dompet & Rekening**: Pantau saldo BCA, Mandiri, Cash, GoPay, OVO, ShopeePay, DANA, dan instrumen investasi secara terpisah.
- 📊 **Analitik & Evaluasi Anggaran**: Donut chart kategori pengeluaran, progress bar batas anggaran bulanan, dan indikator rasio tabungan (*Savings Rate*).
- 💾 **Data Aman & Ekspor**: Mode offline-first dengan LocalStorage, sinkronisasi Supabase Cloud, dan fitur ekspor ke **Excel / CSV** serta cadangan **JSON**.

---

## Menjalankan di Lokal

1. Masuk ke folder proyek:
   ```bash
   cd "d:\Naufal\AI\catatan-keuangan"
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

3. Buka di browser:
   [http://localhost:3000](http://localhost:3000)

---

## Deploy ke Vercel & GitHub

Proyek ini telah dikonfigurasi untuk langsung di-deploy ke GitHub (`naufalirfan`) dan Vercel (`naufalfaster-3813`).
Variabel lingkungan yang diperlukan:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GEMINI_API_KEY` (opsional, bisa diisi di menu Pengaturan aplikasi)
