import os
import subprocess
import time
from PIL import Image

PROJECT_ROOT = r"d:\Naufal\AI\catatan-keuangan"
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
SCREENSHOTS_DIR = os.path.join(PUBLIC_DIR, "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

# We want 1080 x 2400 (aspect ratio 9:20 / 9:16 standard phone screenshot)
# Edge window size: 412 x 915 with high-dpi device scale factor or 1080 x 2400
pages = [
    ("screenshot_1_dashboard.png", "https://catatan-keuangan-nfl.vercel.app/"),
    ("screenshot_2_ai_input.png", "https://catatan-keuangan-nfl.vercel.app/ai-input"),
    ("screenshot_3_analitik.png", "https://catatan-keuangan-nfl.vercel.app/analitik"),
    ("screenshot_4_hutang.png", "https://catatan-keuangan-nfl.vercel.app/hutang"),
]

for filename, url in pages:
    out_path = os.path.join(SCREENSHOTS_DIR, filename)
    cmd = [
        edge_exe,
        "--headless=new",
        "--disable-gpu",
        "--window-size=1080,2400",
        "--force-device-scale-factor=2",
        f"--screenshot={out_path}",
        url
    ]
    print(f"Capturing {filename}...")
    subprocess.run(cmd, capture_output=True)
    if os.path.exists(out_path):
        img = Image.open(out_path)
        # Resize to standard phone dimension 1080 x 2400 if needed
        resized = img.resize((1080, 2400), Image.Resampling.LANCZOS)
        resized.save(out_path, "PNG")
        print(f"Saved {filename}: {resized.size}")

print("All screenshots done!")
