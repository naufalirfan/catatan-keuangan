import os
import subprocess
from PIL import Image

PROJECT_ROOT = r"d:\Naufal\AI\catatan-keuangan"
SVG_PATH = os.path.join(PROJECT_ROOT, "public", "icon.svg")
HTML_PATH = os.path.join(PROJECT_ROOT, "scripts", "render_icon.html")
MASTER_PNG = os.path.join(PROJECT_ROOT, "scripts", "icon_master_1024.png")

with open(SVG_PATH, "r", encoding="utf-8") as f:
    svg_content = f.read()

html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{
    width: 1024px;
    height: 1024px;
    background: transparent;
    overflow: hidden;
  }}
  svg {{
    width: 1024px;
    height: 1024px;
    display: block;
  }}
</style>
</head>
<body>
{svg_content}
</body>
</html>"""

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)

edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_exe,
    "--headless=new",
    "--disable-gpu",
    "--default-background-color=00000000",
    "--window-size=1024,1024",
    f"--screenshot={MASTER_PNG}",
    f"file:///{HTML_PATH.replace(os.sep, '/')}"
]

print("Rendering master PNG with Edge headless...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Edge finished with code:", res.returncode)

if os.path.exists(MASTER_PNG):
    img = Image.open(MASTER_PNG)
    print("Master PNG generated successfully! Size:", img.size, "Mode:", img.mode)
else:
    print("Master PNG NOT generated!")
