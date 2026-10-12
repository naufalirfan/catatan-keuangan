---
name: KashFolio Design System
version: 1.0.0
surface-mode: operate
dials:
  energy: 1     # Calm, focused, distraction-free
  rhythm: 2     # Consistent card grid with purposeful breaks
  motion: 1     # Micro-transitions only (150ms-200ms ease), no bouncing

colors:
  # Dark Theme Primary (Charcoal Obsidian)
  dark-base: "#0c0e12"          # Page ground - deep warm charcoal mineral, never pitch black
  dark-card: "#141720"          # Card & panel background
  dark-card-hover: "#1a1f2c"    # Card hover / active surface
  dark-muted: "#1e2433"         # Input background & secondary inset
  dark-border: "#232a3b"        # Structural 1px hairline border
  dark-border-subtle: "#192030" # Inner dividers
  dark-text-primary: "#f8fafc"  # Headlines, balances, key amounts (high contrast)
  dark-text-secondary: "#94a3b8"# Captions, categories, dates
  dark-text-faint: "#64748b"    # Tertiary meta & inactive controls

  # Light Theme Secondary (Warm Paper & Ink)
  paper-base: "#fbfbfa"         # Light ground
  paper-card: "#ffffff"         # Light card background
  paper-muted: "#f1f1ee"        # Light inset & search fields
  paper-border: "#e2e8f0"       # Light 1px hairline border
  ink-primary: "#0f172a"        # High contrast ink
  ink-secondary: "#475569"      # Secondary ink
  ink-faint: "#94a3b8"          # Subdued ink

  # Financial Semantics (Purposeful, Non-Neon)
  income-green: "#22c55e"       # Positive cash flow / income (+Rp ...)
  income-green-subtle: "rgba(34, 197, 94, 0.12)" # Income badge tint
  expense-red: "#f87171"        # Negative cash flow / expense (-Rp ...)
  expense-red-subtle: "rgba(248, 113, 113, 0.12)" # Expense badge tint
  accent-pine: "#0d9488"        # Brand anchor accent (Teal / Pine restrained)
  amber-warning: "#f59e0b"      # Debt, pending bills, budget warnings

typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    letterSpacing: "-0.025em"
    lineHeight: 1.15
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    letterSpacing: "-0.015em"
    lineHeight: 1.3
  currency:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontVariantNumeric: "tabular-nums"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.01em"

rounded:
  card: "14px"
  button: "10px"
  input: "10px"
  badge: "6px"
  icon: "10px"

spacing:
  tap-target: "44px"            # Minimum touch target for Capacitor Android/iOS
---

# Design System: KashFolio (Charcoal Obsidian)

## 1. Overview & Creative North Star

**Creative North Star: "Charcoal Obsidian Ledger"**

KashFolio adalah alat pencatatan finansial personal harian yang mengutamakan kecepatan input, presisi data numerik, dan ketenangan visual. Desain menolak segala bentuk dekorasi kosmetik AI yang melelahkan mata (*AI Slop*), seperti pendaran neon cyan, blur orbs liar yang mengambang, dan bentuk kapsul (*pill*) berlebihan.

Karakter visualnya tegas: permukaan mineral arang gelap (*Charcoal Obsidian*), pembatas tepi 1px yang terukur rapi, angka saldo yang sejajar sempurna dengan *tabular figures*, serta warna semantik fungsional yang jujur.

## 2. Palet Warna & Semantik Finansial (Anti-Slop R-01, R-25, R-29)

### Dark Mode Ground & Surface
- **Base Ground (#0c0e12)**: Warna arang gelap hangat mineral. Bukan hitam pekat void (#000000).
- **Cards & Containers (#141720)**: Permukaan kartu transaksi dan ringkasan keuangan.
- **Insets & Inputs (#1e2433)**: Permukaan field input form dan tombol sekunder.
- **Hairline Border (#232a3b)**: Garis 1px pembatas antar kartu dan item list.

### Semantik Keuangan yang Jujur
- **Pemasukan (#22c55e)**: Hijau emerald hanya digunakan untuk menandakan uang masuk (+Rp ...). Dilarang digunakan sebagai background tombol umum.
- **Pengeluaran (#f87171)**: Merah koral lembut untuk arus keluar (-Rp ...).
- **Tagihan / Anggaran (#f59e0b)**: Amber hangat untuk peringatan anggaran menipis atau hutang jatuh tempo.
- **Aksen Tunggal Brand (#0d9488)**: Pine teal digunakan secara hemat hanya untuk elemen aksi kunci (misal tombol Tambah / Scan).

### Aturan Kontras WCAG AA (R-25)
- Semua teks utama (#f8fafc) memiliki rasio kontras > 12:1 terhadap background.
- Teks sekunder (#94a3b8) memiliki rasio kontras > 5:1.
- Dilarang menempatkan teks abu-abu redup di atas background gelap yang melanggar standar keterbacaan.

## 3. Tipografi & Angka Keuangan (Impeccable Typeset)

1. **Wajib Tabular Nums**: Semua angka saldo, mutasi transaksi, dan persentase wajib menyertakan kelas Tailwind 	abular-nums (ont-variant-numeric: tabular-nums). Hal ini memastikan setiap digit angka sejajar lurus secara vertikal saat dibandingkan.
2. **Hierarki Saldo Utama**: Total saldo bersih adalah *Single Focal Point* di layar beranda. Dibuat dominan dengan ukuran 	ext-2xl hingga 	ext-3xl font-bold tracking-tight.
3. **Format Mata Uang Konsisten**: Format rupiah selalu ditulis lengkap (Rp 12.500.000) dengan pemisah ribuan titik yang jelas.

## 4. Elevasi, Material, & Radius (Anti-Slop R-10, R-11, R-12, R-13)

1. **Border Over Shadow**: Kedalaman kartu diciptakan oleh perbedaan kontras permukaan dan garis tepi 1px (order border-[#232a3b]), bukan bayangan blur hitam tebal yang membuat elemen melayang tanpa hierarki.
2. **Zero Neon Glow & Zero Blur Orbs**: Dilarang menggunakan elemen dekoratif radial gradient atau blur orbs (lur-2xl, lur-xl) yang tidak memiliki peran fungsional.
3. **Radius Terukur (No Pill Epidemic)**:
   - Kartu: ounded-2xl (14px).
   - Tombol & Field Input: ounded-xl (10px).
   - Status Tag: ounded-md (6px).
   - Bentuk pil (ounded-full) hanya diizinkan untuk tombol avatar atau toggle switch kecil, bukan untuk seluruh container kartu.

## 5. Komponen Utama

### A. Hero Card Saldo Bersih
- Menampilkan total saldo bersih terkonsolidasi dari seluruh rekening/dompet.
- Dilengkapi tombol ikon mata (Eye / EyeOff) untuk privasi menyembunyikan saldo.
- Menampilkan indikator arus kas bersih bulanan (*Net Cashflow*) secara ringkas.

### B. Pemilih Rekening / Akun (Account Scroller)
- Kartu rekening horizontal kompak (BCA, Mandiri, Cash, dll).
- Menampilkan nama rekening, saldo masing-masing, dan label tipe rekening.
- Status aktif/terpilih ditandai dengan border aksen halus, bukan glow neon.

### C. Ringkasan Kategori Pengeluaran
- Daftar kategori pengeluaran terbesar bulan berjalan.
- Menggunakan progress bar ramping (tinggi 4px - 6px) dengan warna kategori teratur.
- Menampilkan persentase terhadap total anggaran.

### D. Riwayat Transaksi (Transaction Feed)
- Ikon kategori dengan badge background bersudut halus (ounded-xl).
- Judul transaksi, catatan rekening asal, tanggal transaksi.
- Jumlah nominal di sebelah kanan: hijau tebal dengan tanda + untuk pemasukan, merah tebal dengan tanda - untuk pengeluaran.

### E. Bottom Navigation Bar (Capacitor Android / iOS)
- Latar belakang matte solid (#141720) dengan border atas 1px (#232a3b).
- Aman terhadap *safe area insets* perangkat mobile (pb-safe).
- Tombol aksi tengah (Scan / Tambah) berukuran minimal 48px, solid pine teal, tanpa pendaran glow liar.
- Seluruh ikon menu memiliki tap target minimal 44px x 44px.

## 6. Standar Keandalan & State (Anti-Slop R-26, R-27, R-32)

1. **3 State Wajib**:
   - **Loading State**: Komponen skeleton berdenyut lembut pada posisi data persis.
   - **Empty State**: Ketika belum ada data transaksi/anggaran, sediakan ilustrasi ikon fungsional yang ramah dan tombol aksi langsung untuk mulai mencatat.
   - **Error State**: Pesan jelas jika gagal mengambil data lokal atau sinkronisasi Supabase/Google Drive.
2. **Aksesibilitas & Keyboard**:
   - Seluruh form transaksi dapat dioperasikan penuh dengan navigasi keyboard (Tab, Enter, Escape).
   - Indikator focus ring terlihat jelas (ocus-visible:ring-2 focus-visible:ring-teal-500/50).

## 7. Hal yang Dilarang (Do Not)

- Dilarang menggunakan gradien ungu-ke-cyan generik.
- Dilarang menaruh ikon bintang AI sparkle (✨) pada elemen non-AI atau menjadikannya pemanis acak.
- Dilarang menggunakan floating blur bubbles di background.
- Dilarang membiarkan tombol atau link mati tanpa aksi fungsional.
- Dilarang menggunakan angka tanpa pemisah ribuan yang rapi.