from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = "public/icons"
os.makedirs(OUT_DIR, exist_ok=True)

LIME = (139, 224, 78, 255)
INK = (11, 11, 12, 255)
WHITE = (255, 255, 255, 255)


def find_font(size):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def draw_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if maskable:
        # Fill full bleed background (maskable icons should have safe-zone padding)
        draw.rectangle([0, 0, size, size], fill=INK)
        pad = int(size * 0.18)
    else:
        radius = int(size * 0.22)
        draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=INK)
        pad = int(size * 0.1)

    # Lime accent circle
    circle_size = int(size * 0.34)
    cx, cy = size // 2, int(size * 0.4)
    draw.ellipse(
        [cx - circle_size, cy - circle_size, cx + circle_size, cy + circle_size],
        fill=LIME,
    )

    text = "С"
    font = find_font(int(size * 0.42))
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1]), text, font=font, fill=INK)

    return img


sizes = [192, 512]
for s in sizes:
    draw_icon(s, maskable=False).save(f"{OUT_DIR}/icon-{s}.png")
    draw_icon(s, maskable=True).save(f"{OUT_DIR}/icon-maskable-{s}.png")

# Favicon
draw_icon(64, maskable=False).save("public/favicon.png")

print("Generated icons:", os.listdir(OUT_DIR))
