import os
import subprocess
from PIL import Image

PROJECT_ROOT = r"d:\Naufal\AI\catatan-keuangan"
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
SCRIPTS_DIR = os.path.join(PROJECT_ROOT, "scripts")
OUTPUT_DIR = os.path.join(PUBLIC_DIR, "store_screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

screens = [
    {
        "filename": "1_dashboard_keuangan.png",
        "tag": "ARUS KAS & SALDO REAL-TIME",
        "title": "Pantau Keuangan & Dompet",
        "subtitle": "Ketahui saldo tunai, bank, dan e-wallet secara akurat setiap saat.",
        "content": """
        <div class="mock-card">
          <div class="balance-header">
            <span class="label">Total Saldo Terkumpul</span>
            <div class="amount">Rp 20.450.000</div>
          </div>
          <div class="stats-row">
            <div class="stat-box income">
              <span class="stat-label">↓ Pemasukan</span>
              <span class="stat-val">+Rp 14.500.000</span>
            </div>
            <div class="stat-box expense">
              <span class="stat-label">↑ Pengeluaran</span>
              <span class="stat-val">-Rp 3.250.000</span>
            </div>
          </div>
        </div>

        <div class="accounts-grid">
          <div class="account-item">
            <div class="acc-icon">🏦</div>
            <div class="acc-info">
              <div class="acc-name">BCA Prioritas</div>
              <div class="acc-num">Bank • Utama</div>
            </div>
            <div class="acc-bal">Rp 14.500.000</div>
          </div>
          <div class="account-item">
            <div class="acc-icon">📱</div>
            <div class="acc-info">
              <div class="acc-name">GoPay / OVO</div>
              <div class="acc-num">E-Wallet</div>
            </div>
            <div class="acc-bal">Rp 5.200.000</div>
          </div>
          <div class="account-item">
            <div class="acc-icon">💵</div>
            <div class="acc-info">
              <div class="acc-name">Uang Tunai</div>
              <div class="acc-num">Dompet Fisik</div>
            </div>
            <div class="acc-bal">Rp 750.000</div>
          </div>
        </div>
        """
    },
    {
        "filename": "2_ai_input_cerdas.png",
        "tag": "INPUT CERDAS KECERDASAN BUATAN",
        "title": "Catat Instan dengan AI",
        "subtitle": "Cukup ketik atau bicara santai, AI otomatis mendeteksi nominal & kategori.",
        "content": """
        <div class="ai-prompt-box">
          <div class="ai-header">
            <span class="sparkle">✨</span> Asisten Finansial AI
          </div>
          <div class="user-bubble">
            "Makan siang ayam geprek 25rb pakai gopay dan beli bensin motor 30rb tunai"
          </div>
          <div class="ai-result">
            <div class="ai-tag">✓ 2 Transaksi Terdeteksi Otomatis:</div>
            <div class="detected-item">
              <span>🍛 Makanan & Minuman</span>
              <span class="red">-Rp 25.000 (GoPay)</span>
            </div>
            <div class="detected-item">
              <span>⛽ Transportasi / Bensin</span>
              <span class="red">-Rp 30.000 (Tunai)</span>
            </div>
            <button class="mock-btn">Simpan Transaksi Sekaligus</button>
          </div>
        </div>
        """
    },
    {
        "filename": "3_analitik_visual.png",
        "tag": "GRAFIK & EVALUASI ANGGARAN",
        "title": "Grafik Analisis Mendalam",
        "subtitle": "Ketahui ke mana uang Anda habis dengan visualisasi kategori yang jelas.",
        "content": """
        <div class="chart-card">
          <div class="chart-title">Pengeluaran Terbesar Bulan Ini</div>
          <div class="progress-item">
            <div class="prog-info">
              <span>🏠 Tempat Tinggal & Kos</span>
              <span>Rp 1.500.000 (46%)</span>
            </div>
            <div class="bar-bg"><div class="bar-fill" style="width: 46%; background: #10b981;"></div></div>
          </div>
          <div class="progress-item">
            <div class="prog-info">
              <span>🍽️ Makanan & Kebutuhan</span>
              <span>Rp 950.000 (29%)</span>
            </div>
            <div class="bar-bg"><div class="bar-fill" style="width: 29%; background: #3b82f6;"></div></div>
          </div>
          <div class="progress-item">
            <div class="prog-info">
              <span>💡 Tagihan, Listrik & Wifi</span>
              <span>Rp 480.000 (15%)</span>
            </div>
            <div class="bar-bg"><div class="bar-fill" style="width: 15%; background: #f59e0b;"></div></div>
          </div>
          <div class="progress-item">
            <div class="prog-info">
              <span>☕ Hiburan & Santai</span>
              <span>Rp 320.000 (10%)</span>
            </div>
            <div class="bar-bg"><div class="bar-fill" style="width: 10%; background: #ec4899;"></div></div>
          </div>
        </div>
        """
    },
    {
        "filename": "4_hutang_piutang.png",
        "tag": "TERATUR & BEBAS LUPA",
        "title": "Catat Hutang & Piutang",
        "subtitle": "Pantau pinjaman rekan dan jatuh tempo hutang agar finansial tetap sehat.",
        "content": """
        <div class="debt-summary">
          <div class="debt-card receivable">
            <span class="d-label">Total Piutang (Orang Lain Hutang)</span>
            <span class="d-amount">Rp 2.400.000</span>
          </div>
          <div class="debt-card payable">
            <span class="d-label">Total Hutang Anda</span>
            <span class="d-amount">Rp 500.000</span>
          </div>
        </div>

        <div class="debt-list">
          <div class="debt-item">
            <div class="person-avatar">R</div>
            <div class="person-info">
              <div class="p-name">Rian (Teman Kantor)</div>
              <div class="p-sub">Piutang • Pinjam untuk servis motor</div>
            </div>
            <div class="p-val green">Rp 1.000.000</div>
          </div>
          <div class="debt-item">
            <div class="person-avatar">D</div>
            <div class="person-info">
              <div class="p-name">Dimas</div>
              <div class="p-sub">Piutang • Patungan tiket liburan</div>
            </div>
            <div class="p-val green">Rp 1.400.000</div>
          </div>
          <div class="debt-item">
            <div class="person-avatar">A</div>
            <div class="person-info">
              <div class="p-name">Andi Saputra</div>
              <div class="p-sub">Hutang • Talangan beli sparepart</div>
            </div>
            <div class="p-val orange">-Rp 500.000</div>
          </div>
        </div>
        """
    }
]

base_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{
    width: 1080px;
    height: 1920px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #020617;
    color: #f8fafc;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }}
  .glow-top {{
    position: absolute;
    width: 800px;
    height: 600px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%);
    top: -150px;
    left: 50%;
    transform: translateX(-50%);
    filter: blur(60px);
    pointer-events: none;
  }}
  .header-container {{
    margin-top: 90px;
    text-align: center;
    padding: 0 60px;
    z-index: 5;
  }}
  .tag-badge {{
    display: inline-block;
    padding: 8px 24px;
    border-radius: 9999px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(52, 211, 153, 0.35);
    color: #34d399;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 24px;
    text-transform: uppercase;
  }}
  h1 {{
    font-size: 64px;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 18px;
    background: linear-gradient(135deg, #ffffff 40%, #a7f3d0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  p.subtitle {{
    font-size: 28px;
    line-height: 1.45;
    color: #94a3b8;
    max-width: 900px;
    margin: 0 auto;
  }}
  .phone-frame {{
    margin-top: 70px;
    width: 860px;
    height: 1250px;
    background: #0f172a;
    border-radius: 48px 48px 0 0;
    border: 8px solid #1e293b;
    border-bottom: none;
    box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(16, 185, 129, 0.15);
    padding: 40px 36px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }}
  .phone-notch {{
    width: 220px;
    height: 24px;
    background: #1e293b;
    border-radius: 12px;
    margin: 0 auto 12px auto;
  }}
  .mock-card {{
    background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
    border: 2px solid #059669;
    border-radius: 28px;
    padding: 36px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.4);
  }}
  .balance-header .label {{
    font-size: 22px;
    color: #a7f3d0;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 600;
  }}
  .balance-header .amount {{
    font-size: 58px;
    font-weight: 800;
    color: #ffffff;
    margin-top: 8px;
  }}
  .stats-row {{
    display: flex;
    gap: 20px;
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid rgba(255,255,255,0.15);
  }}
  .stat-box {{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }}
  .stat-label {{ font-size: 20px; color: #cbd5e1; }}
  .stat-val {{ font-size: 28px; font-weight: 700; }}
  .income .stat-val {{ color: #34d399; }}
  .expense .stat-val {{ color: #f87171; }}
  .accounts-grid {{
    display: flex;
    flex-direction: column;
    gap: 16px;
  }}
  .account-item {{
    display: flex;
    align-items: center;
    gap: 20px;
    background: #1e293b;
    border: 1px solid #334155;
    padding: 22px 28px;
    border-radius: 22px;
  }}
  .acc-icon {{
    font-size: 38px;
    width: 64px;
    height: 64px;
    background: #0f172a;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }}
  .acc-info {{ flex: 1; }}
  .acc-name {{ font-size: 26px; font-weight: 700; color: #ffffff; }}
  .acc-num {{ font-size: 19px; color: #94a3b8; margin-top: 2px; }}
  .acc-bal {{ font-size: 28px; font-weight: 700; color: #f1f5f9; }}

  .ai-prompt-box {{
    background: #1e293b;
    border: 2px solid #334155;
    border-radius: 28px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }}
  .ai-header {{
    font-size: 24px;
    font-weight: 700;
    color: #34d399;
    display: flex;
    align-items: center;
    gap: 10px;
  }}
  .user-bubble {{
    background: #0f172a;
    border: 1px solid #334155;
    padding: 24px;
    border-radius: 20px;
    font-size: 24px;
    color: #e2e8f0;
    line-height: 1.4;
    font-style: italic;
  }}
  .ai-result {{
    background: #064e3b;
    border: 1px solid #059669;
    padding: 24px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }}
  .ai-tag {{ font-size: 20px; font-weight: 700; color: #6ee7b7; }}
  .detected-item {{
    display: flex;
    justify-content: space-between;
    font-size: 23px;
    font-weight: 600;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }}
  .detected-item .red {{ color: #fca5a5; }}
  .mock-btn {{
    background: #10b981;
    color: #ffffff;
    border: none;
    padding: 18px;
    font-size: 24px;
    font-weight: 700;
    border-radius: 16px;
    margin-top: 8px;
  }}

  .chart-card {{
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 28px;
    padding: 36px;
    display: flex;
    flex-direction: column;
    gap: 26px;
  }}
  .chart-title {{
    font-size: 28px;
    font-weight: 700;
    color: #f1f5f9;
  }}
  .progress-item {{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }}
  .prog-info {{
    display: flex;
    justify-content: space-between;
    font-size: 22px;
    font-weight: 600;
    color: #cbd5e1;
  }}
  .bar-bg {{
    width: 100%;
    height: 16px;
    background: #0f172a;
    border-radius: 9999px;
    overflow: hidden;
  }}
  .bar-fill {{
    height: 100%;
    border-radius: 9999px;
  }}

  .debt-summary {{
    display: flex;
    gap: 16px;
  }}
  .debt-card {{
    flex: 1;
    padding: 24px;
    border-radius: 22px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }}
  .debt-card.receivable {{
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.35);
  }}
  .debt-card.payable {{
    background: rgba(244, 63, 94, 0.15);
    border: 1px solid rgba(244, 63, 94, 0.35);
  }}
  .d-label {{ font-size: 18px; color: #94a3b8; font-weight: 600; }}
  .d-amount {{ font-size: 32px; font-weight: 800; color: #ffffff; }}
  .debt-list {{
    display: flex;
    flex-direction: column;
    gap: 14px;
  }}
  .debt-item {{
    display: flex;
    align-items: center;
    gap: 20px;
    background: #1e293b;
    border: 1px solid #334155;
    padding: 20px 24px;
    border-radius: 20px;
  }}
  .person-avatar {{
    width: 56px;
    height: 56px;
    background: #334155;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 800;
    color: #60a5fa;
  }}
  .person-info {{ flex: 1; }}
  .p-name {{ font-size: 24px; font-weight: 700; color: #f8fafc; }}
  .p-sub {{ font-size: 18px; color: #94a3b8; margin-top: 2px; }}
  .p-val {{ font-size: 26px; font-weight: 700; }}
  .p-val.green {{ color: #34d399; }}
  .p-val.orange {{ color: #fb923c; }}
</style>
</head>
<body>
  <div class="glow-top"></div>
  <div class="header-container">
    <div class="tag-badge">{tag}</div>
    <h1>{title}</h1>
    <p class="subtitle">{subtitle}</p>
  </div>
  <div class="phone-frame">
    <div class="phone-notch"></div>
    {content}
  </div>
</body>
</html>"""

for s in screens:
    out_file = os.path.join(OUTPUT_DIR, s["filename"])
    html_file = os.path.join(SCRIPTS_DIR, f"temp_{s['filename']}.html")
    rendered = base_template.format(
        tag=s["tag"],
        title=s["title"],
        subtitle=s["subtitle"],
        content=s["content"]
    )
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(rendered)
    
    cmd = [
        edge_exe,
        "--headless=new",
        "--disable-gpu",
        "--window-size=1080,1920",
        f"--screenshot={out_file}",
        f"file:///{html_file.replace(os.sep, '/')}"
    ]
    print(f"Rendering {s['filename']}...")
    subprocess.run(cmd, capture_output=True)
    if os.path.exists(out_file):
        img = Image.open(out_file)
        if img.size != (1080, 1920):
            img = img.crop((0, 0, 1080, 1920))
            img.save(out_file, "PNG")
        print(f"Generated {s['filename']}: {img.size}")
    if os.path.exists(html_file):
        os.remove(html_file)

print("All Play Store screenshots successfully generated!")
