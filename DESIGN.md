---
name: KashFolio - Nordic Mint Neobank
version: 2.0.0
surface-mode: operate
dials:
  energy: 3     # High energy, vibrant contrast, bold accents
  rhythm: 3     # Asymmetric widgets, modular cards, distinct hero
  motion: 2     # Smooth 200ms ease-out transitions, tactile active presses

colors:
  # Light Theme Foundation (Porcelain White & Deep Ink)
  porcelain-base: "#f8fafc"     # Page ground - clean, bright, modern
  card-light: "#ffffff"         # Crisp card surface
  card-border-light: "#e2e8f0"  # Subtle 1px boundary
  ink-primary: "#0f172a"        # Deep slate text
  ink-secondary: "#64748b"      # Muted subheadings & metadata

  # Dark Theme Foundation (Midnight Navy)
  midnight-base: "#0a0e17"      # Dark ground - rich navy slate
  card-dark: "#121826"          # Dark card surface
  card-border-dark: "#1e293b"   # Dark border
  text-dark-primary: "#f8fafc"  # Bright white text
  text-dark-secondary: "#94a3b8"# Secondary dark text

  # Signature Neobank Accents (High Contrast)
  hero-navy: "#0b1329"          # Hero card ground in both modes (focal anchor)
  electric-mint: "#10b981"      # Primary brand accent (Mint / Emerald)
  electric-mint-glow: "rgba(16, 185, 129, 0.25)"
  warm-saffron: "#f59e0b"       # Secondary accent (Saffron / Gold for PRO & Goals)
  coral-expense: "#f43f5e"      # Clear energetic negative cashflow
  
  # Modular Account Card Tints (Light mode distinctive cards)
  card-bca-bg: "#eff6ff"        # Light sky tint
  card-bca-border: "#bfdbfe"
  card-bca-text: "#1e40af"
  
  card-mandiri-bg: "#fef3c7"    # Warm gold sand tint
  card-mandiri-border: "#fde68a"
  card-mandiri-text: "#92400e"
  
  card-cash-bg: "#ecfdf5"       # Fresh mint tint
  card-cash-border: "#a7f3d0"
  card-cash-text: "#065f46"

typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    letterSpacing: "-0.02em"
  currency:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontVariantNumeric: "tabular-nums"
    fontWeight: 800
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    lineHeight: 1.5

rounded:
  hero: "24px"
  card: "20px"
  button: "14px"
  badge: "999px"
  icon: "14px"

spacing:
  tap-target: "48px"
---

# Design System: KashFolio (Nordic Mint Neobank)

## 1. Creative North Star: "Nordic Mint Neobank"

KashFolio mengadopsi estetika neobank modern Eropa (Monzo, Wise, N26):
- **Cerah, Energik, dan Berkepribadian Kuat**: Bukan sekadar aplikasi gelap monokrom yang datar. Desain ini memadukan kanvas porselen bersih (#f8fafc) dengan kartu utama **Midnight Navy (#0b1329)** yang memikat.
- **Electric Mint Green (#10b981)** menjadi identitas pahlawan yang menyala pada saldo utama, tombol aksi tengah, dan arus kas masuk.
- **Warm Saffron Gold (#f59e0b)** memberikan aksen hangat pada status tabungan, badge PRO, dan peringatan anggaran.
- **Modular Multi-Color Account Cards**: Rekening BCA, Mandiri, dan Uang Tunai tampil dengan warna kartu bertema taktil yang mudah dibedakan dalam sekejap.

## 2. Dials Antislop
- **ENERGY: 3 (High Energy)**: Kontras tinggi, warna hidup, fokus visual yang magnetik.
- **RHYTHM: 3 (Asymmetric & Modular)**: Variasi bentuk antara kartu saldo besar, kartu rekening horizontal, dan progress ring.
- **MOTION: 2 (Smooth & Tactile)**: Efek hover/active press 95% scale yang responsif untuk jempol mobile.

## 3. Komponen Utama

### A. Hero Balance Card (Midnight Anchor)
- Selalu bertema **Deep Midnight Navy (#0b1329)** baik di mode siang maupun malam.
- Angka total saldo ditampilkan dalam **Electric Mint Green** tebal (	ext-emerald-400 font-extrabold text-3xl sm:text-4xl tabular-nums).
- Dilengkapi badge status tabungan (*Savings Target*) dan perbandingan pemasukan vs pengeluaran yang jelas.

### B. Modular Account Cards (BCA, Mandiri, Cash)
- Menggunakan palet kartu yang khas:
  - BCA: Sentuhan Sky Blue (#eff6ff / #1e40af di light; dark card di dark).
  - Mandiri: Sentuhan Sand Gold (#fef3c7 / #92400e).
  - Cash: Sentuhan Mint Green (#ecfdf5 / #065f46).

### C. Floating Floating Action Button (FAB) di Bottom Nav
- Tombol tengah berbentuk bulat taktil 52px dengan warna **Electric Mint (g-emerald-500 hover:bg-emerald-400)** dan shadow hijau lembut (shadow-emerald-500/30).