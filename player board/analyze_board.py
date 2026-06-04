from PIL import Image
img = Image.open("D:/claude project/game/35cd6588fd40ea9ab8d2601220114595.png")
print(f"Size: {img.size}, Mode: {img.mode}")
img = img.convert('RGB')
w, h = img.size
# Sample center row
y = h // 2
for x in range(0, w, 50):
    r, g, b = img.getpixel((x, y))
    print(f"({x},{y}): RGB({r},{g},{b})")
print("---")
# Sample center column
x = w // 2
for y in range(0, h, 50):
    r, g, b = img.getpixel((x, y))
    print(f"({x},{y}): RGB({r},{g},{b})")
