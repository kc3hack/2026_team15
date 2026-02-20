from PIL import Image, ImageDraw

# 1024x1024の画像を作成
size = 1024
img = Image.new('RGB', (size, size), (0, 0, 0))
draw = ImageDraw.Draw(img)

# 角丸のマスク用画像
mask = Image.new('L', (size, size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([(0, 0), (size-1, size-1)], radius=220, fill=255)

# グラデーションを描画（薄暗いInstagram風）
for y in range(size):
    for x in range(size):
        # 左上から右下へのグラデーション
        ratio = (x + y) / (2 * size)
        r = int(128 + 60 * (1 - ratio) - 60)  # 薄暗く
        g = int(40 + 50 * ratio - 40)          # 薄暗く
        b = int(120 + 80 * ratio - 60)         # 薄暗く
        draw.point((x, y), (max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))))

# 角丸を適用
img.putalpha(mask)

# カメラアイコンを描画（白っぽく、薄暗く）
center = size // 2
camera_size = 300
# カメラ本体
draw.ellipse(
    [(center - camera_size//2, center - camera_size//2), 
     (center + camera_size//2, center + camera_size//2)],
    outline=(180, 180, 180), width=20
)

img.save('icon_1024.png')
print("Created icon_1024.png")
