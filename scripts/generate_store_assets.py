import os
import subprocess
from PIL import Image

PROJECT_ROOT = r"d:\Naufal\AI\catatan-keuangan"
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
SCRIPTS_DIR = os.path.join(PROJECT_ROOT, "scripts")
ICON_SVG_PATH = os.path.join(PUBLIC_DIR, "icon.svg")
FEATURE_GRAPHIC_PNG = os.path.join(PUBLIC_DIR, "play_store_feature_graphic_1024x500.png")

with open(ICON_SVG_PATH, "r", encoding="utf-8") as f:
    svg_content = f.read()

# Generate 1024x500 Feature Graphic HTML
feature_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{
    width: 1024px;
    height: 500px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: radial-gradient(circle at 80% 20%, #064e3b 0%, #022c22 35%, #0f172a 75%, #020617 100%);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40px 70px;
    position: relative;
  }}
  .ambient-glow {{
    position: absolute;
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
    top: 50%;
    right: 80px;
    transform: translateY(-50%);
    filter: blur(40px);
    pointer-events: none;
  }}
  .left {{
    max-width: 540px;
    z-index: 2;
  }}
  .badge {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 9999px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(52, 211, 153, 0.3);
    color: #34d399;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 20px;
    text-transform: uppercase;
  }}
  h1 {{
    font-size: 46px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.5px;
    margin-bottom: 14px;
    background: linear-gradient(135deg, #ffffff 40%, #a7f3d0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  p {{
    font-size: 18px;
    line-height: 1.5;
    color: #94a3b8;
    margin-bottom: 24px;
  }}
  .pill-container {{
    display: flex;
    gap: 12px;
  }}
  .pill {{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(51, 65, 85, 0.8);
    padding: 8px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #e2e8f0;
  }}
  .right {{
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }}
  .icon-wrapper {{
    width: 250px;
    height: 250px;
    filter: drop-shadow(0 25px 35px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 50px rgba(16, 185, 129, 0.35));
  }}
  .icon-wrapper svg {{
    width: 100%;
    height: 100%;
    display: block;
  }}
</style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="left">
    <div class="badge">✦ Aplikasi Pencatat Finansial Cerdas</div>
    <h1>KashFolio</h1>
    <p>Kelola arus kas harian, pantau anggaran, dan catat hutang piutang dengan praktis, aman, dan bebas iklan.</p>
    <div class="pill-container">
      <div class="pill">⚡ Input Cepat & AI</div>
      <div class="pill">📊 Analisis Visual</div>
      <div class="pill">🔒 Privasi Aman</div>
    </div>
  </div>
  <div class="right">
    <div class="icon-wrapper">
      {svg_content}
    </div>
  </div>
</body>
</html>"""

FEATURE_HTML_PATH = os.path.join(SCRIPTS_DIR, "render_feature.html")
with open(FEATURE_HTML_PATH, "w", encoding="utf-8") as f:
    f.write(feature_html)

edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_exe,
    "--headless=new",
    "--disable-gpu",
    "--window-size=1024,500",
    f"--screenshot={FEATURE_GRAPHIC_PNG}",
    f"file:///{FEATURE_HTML_PATH.replace(os.sep, '/')}"
]

print("Rendering Feature Graphic (1024x500)...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Edge code:", res.returncode)

if os.path.exists(FEATURE_GRAPHIC_PNG):
    img = Image.open(FEATURE_GRAPHIC_PNG)
    # Ensure exact 1024x500
    if img.size != (1024, 500):
        img = img.crop((0, 0, 1024, 500))
        img.save(FEATURE_GRAPHIC_PNG, "PNG")
    print("Feature Graphic ready:", img.size, FEATURE_GRAPHIC_PNG)
else:
    print("Feature Graphic failed!")
