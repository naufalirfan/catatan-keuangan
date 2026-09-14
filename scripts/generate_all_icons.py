import os
from PIL import Image, ImageDraw

PROJECT_ROOT = r"d:\Naufal\AI\catatan-keuangan"
MASTER_PATH = os.path.join(PROJECT_ROOT, "scripts", "icon_master_1024.png")

if not os.path.exists(MASTER_PATH):
    raise FileNotFoundError(f"Master icon not found at {MASTER_PATH}")

master = Image.open(MASTER_PATH).convert("RGBA")

# 1. Colors
BG_COLOR = (15, 23, 42, 255) # #0f172a (KashFolio slate-900 brand background)

# Helper function to place icon centered on canvas with scaling
def make_icon_on_bg(size, scale=0.75, bg_shape=None, bg_color=BG_COLOR):
    """
    size: (w, h)
    scale: float fraction of min(w, h) that the graphic should occupy
    bg_shape: None, 'rect', 'round_rect', 'circle'
    """
    w, h = size
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    if bg_shape == 'rect':
        draw.rectangle([0, 0, w, h], fill=bg_color)
    elif bg_shape == 'round_rect':
        radius = int(min(w, h) * 0.22)
        draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=bg_color)
    elif bg_shape == 'circle':
        draw.ellipse([0, 0, w - 1, h - 1], fill=bg_color)

    # Scale master icon preserving aspect ratio
    mw, mh = master.size
    target_dim = int(min(w, h) * scale)
    ratio = min(target_dim / mw, target_dim / mh)
    nw, nh = int(mw * ratio), int(mh * ratio)
    
    resized_master = master.resize((nw, nh), Image.Resampling.LANCZOS)
    
    # Paste centered
    ox = (w - nw) // 2
    oy = (h - nh) // 2
    canvas.alpha_composite(resized_master, (ox, oy))
    return canvas

def make_splash(width, height):
    canvas = Image.new("RGB", (width, height), (15, 23, 42)) # #0f172a solid RGB
    
    # Logo size: ~28% of shortest dimension or reasonable max
    shortest = min(width, height)
    logo_size = int(shortest * 0.38)
    if logo_size < 120:
        logo_size = 120
    if logo_size > 480:
        logo_size = 480
        
    mw, mh = master.size
    ratio = min(logo_size / mw, logo_size / mh)
    nw, nh = int(mw * ratio), int(mh * ratio)
    
    resized = master.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = (width - nw) // 2
    oy = (height - nh) // 2
    
    canvas.paste(resized, (ox, oy), resized)
    return canvas

print("1. Generating Web Assets...")
public_dir = os.path.join(PROJECT_ROOT, "public")

# flying-money.png (512x512 transparent)
flying_money = master.resize((512, 512), Image.Resampling.LANCZOS)
flying_money.save(os.path.join(public_dir, "flying-money.png"), "PNG")

# icon.png (512x512 transparent)
icon_png = master.resize((512, 512), Image.Resampling.LANCZOS)
icon_png.save(os.path.join(public_dir, "icon.png"), "PNG")

# icon-192.png & icon-512.png
master.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "icon-192.png"), "PNG")
master.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "icon-512.png"), "PNG")

# apple-touch-icon.png (180x180 with rich bg)
apple_touch = make_icon_on_bg((180, 180), scale=0.76, bg_shape='rect', bg_color=BG_COLOR)
apple_touch.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

# favicon.ico (multi-frame: 16x16, 32x32, 48x48)
ico_images = [
    master.resize((16, 16), Image.Resampling.LANCZOS),
    master.resize((32, 32), Image.Resampling.LANCZOS),
    master.resize((48, 48), Image.Resampling.LANCZOS)
]
ico_images[0].save(
    os.path.join(public_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=ico_images[1:]
)
print("-> Web assets generated successfully.")

# Google Play Store 512x512 Icon
play_store_icon = make_icon_on_bg((512, 512), scale=0.78, bg_shape='rect', bg_color=BG_COLOR)
play_store_icon.save(os.path.join(PROJECT_ROOT, "public", "play_store_icon_512.png"), "PNG")
android_dir = os.path.join(PROJECT_ROOT, "android")
play_store_icon.save(os.path.join(android_dir, "play_store_icon_512.png"), "PNG")
print("-> Google Play Store 512x512 icon generated.")

print("2. Generating Android Launcher Icons...")
# Densities: (name, launcher_size, foreground_size)
android_densities = {
    "mipmap-mdpi": (48, 108),
    "mipmap-hdpi": (72, 162),
    "mipmap-xhdpi": (96, 216),
    "mipmap-xxhdpi": (144, 324),
    "mipmap-xxxhdpi": (192, 432),
}

res_dir = os.path.join(PROJECT_ROOT, "android", "app", "src", "main", "res")

for folder, (l_size, f_size) in android_densities.items():
    target_folder = os.path.join(res_dir, folder)
    os.makedirs(target_folder, exist_ok=True)
    
    # 1) ic_launcher.png (legacy rounded square)
    launcher = make_icon_on_bg((l_size, l_size), scale=0.75, bg_shape='round_rect', bg_color=BG_COLOR)
    launcher.save(os.path.join(target_folder, "ic_launcher.png"), "PNG")
    
    # 2) ic_launcher_round.png (legacy circle)
    launcher_round = make_icon_on_bg((l_size, l_size), scale=0.72, bg_shape='circle', bg_color=BG_COLOR)
    launcher_round.save(os.path.join(target_folder, "ic_launcher_round.png"), "PNG")
    
    # 3) ic_launcher_foreground.png (transparent foreground for adaptive icon; safe zone scale=0.66)
    foreground = make_icon_on_bg((f_size, f_size), scale=0.66, bg_shape=None)
    foreground.save(os.path.join(target_folder, "ic_launcher_foreground.png"), "PNG")

print("-> Android launcher icons generated.")

print("3. Updating ic_launcher_background.xml to #0f172a...")
bg_xml_path = os.path.join(res_dir, "values", "ic_launcher_background.xml")
with open(bg_xml_path, "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0f172a</color>\n</resources>\n')

print("4. Generating Android Splash Screens...")
splash_specs = [
    ("drawable", 480, 320),
    ("drawable-land-hdpi", 800, 480),
    ("drawable-land-mdpi", 480, 320),
    ("drawable-land-xhdpi", 1280, 720),
    ("drawable-land-xxhdpi", 1600, 960),
    ("drawable-land-xxxhdpi", 1920, 1280),
    ("drawable-port-hdpi", 480, 800),
    ("drawable-port-mdpi", 320, 480),
    ("drawable-port-xhdpi", 720, 1280),
    ("drawable-port-xxhdpi", 960, 1600),
    ("drawable-port-xxxhdpi", 1280, 1920),
]

for folder, w, h in splash_specs:
    s_folder = os.path.join(res_dir, folder)
    os.makedirs(s_folder, exist_ok=True)
    splash_img = make_splash(w, h)
    splash_img.save(os.path.join(s_folder, "splash.png"), "PNG")

print("-> Splash screens generated.")
print("All assets generated successfully!")
