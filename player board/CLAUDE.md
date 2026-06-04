# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

勃艮第城堡 (Castles of Burgundy) 玩家版图 HTML 复刻 — 单文件 HTML 页面，用六边形网格地图、地形颜色和 UI 元素还原中文版玩家版图。

## File Structure

- **`board-game-mat.html`**: 唯一生产文件。所有 CSS、HTML、JS 内联在一个文件中。浏览器直接打开即可查看。
- **`35cd6588fd40ea9ab8d2601220114595.png`**: 参考图片（原版版图截图 565×754），用于网格定位和颜色提取。
- **分析脚本** (Node.js): 从参考图片提取六边形位置和地形颜色的工具链，非生产代码。
  - `analyze_grid.js` / `find_hex_grid.js` / `scan_grid.js` — 初始扫描和检测
  - `refine_grid.js` / `optimize_grid.js` — 精调和参数优化（依赖 pngjs）
  - `hex_raw.js` / `find_bounds.js` — 原始数据和边界检测
  - `analyze_colors.js` — 各地形颜色提取
- **`analyze_board.py`**: Python/Pillow 简易图像分析脚本，作用同上。
- **`package.json`**: 仅依赖 `pngjs`。

## Hex Grid — 0.5 精度坐标系统

37 个六边形，7 行布局 `4-5-6-7-6-5-4`，以第 4 排第 3 列（城堡）为中心轴对称排列。

### Key Constants

| Constant | Value | Description |
|----------|-------|-------------|
| W | 72 | Hex width (px) |
| H | 83 | Hex height (px) |
| VG | H*3/4 = 62.25 | Vertical gap between rows |
| HO | W/2 = 36 | (保留但不再用于渲染) |
| BX | 65 | Board X offset（与标题中心对齐） |
| BY | 18 | Board Y offset |

### 渲染公式

```
cx = BX + c * W
cy = BY + r * VG
left = cx - W/2
top  = cy - H/2
```

**不再使用奇数行偏移** — 偏移量已编码在 DATA 的浮点列坐标中。

### DATA 格式

```js
// [row, col, terrainKey, dieValue?, mark?, special?]
[0, 1.5, 'pasture']        // 第0行，col 1.5，牧场
[3, 3.0, 'castle']         // 第3行，col 3.0，城堡（中心格）
[4, 2.5, 'mine']           // 第4行，col 2.5，矿坑
```

- `col` 是 0.5 精度的浮点数（0.0, 0.5, 1.0, 1.5, …）
- `dieValue?`: 骰子数字 1-6（可选）
- `mark?`: 特殊标记（`'🔥'`, `'①'` 等，可选）
- `special?`: 特殊格标记（可选）

### 六边形

- 尖头六边形（pointy-top），CSS `clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)`
- 每个格子渲染：地形图标 + 中文标签 + 骰子数字（可选）+ 标记（可选）

### 地形配置

```js
const T = {
  pasture:   { i:'🌿', l:'牧场',   c:'t-pasture',   dc:'...' },
  river:     { i:'🌊', l:'河流',   c:'t-river',      dc:'...' },
  city:      { i:'🏙️', l:'城市',  c:'t-city',       dc:'...' },
  knowledge: { i:'📚', l:'知识',   c:'t-knowledge',  dc:'...' },
  castle:    { i:'🏰', l:'城堡',   c:'t-castle',     dc:'...' },
  mine:      { i:'⛏️', l:'矿坑',  c:'t-mine',       dc:'...' },
};
```

`i` = 图标，`l` = 中文标签，`c` = CSS 类名，`dc` = 骰子渐变色。

### 地形颜色

CSS 类 `.t-*` 控制背景色（渐变）。如需调整色值，同时更新 CSS class 和 JS `T` 对象中的 `dc`（骰子颜色）。

### 网格对称性

整个版图以 `(row=3, col=3.0)` 的城堡为中心轴对称：
- Row 0 ↔ Row 6: 4 hexes, 偏移量 1.5
- Row 1 ↔ Row 5: 5 hexes, 偏移量 1.0
- Row 2 ↔ Row 4: 6 hexes, 偏移量 0.5
- Row 3: 7 hexes, 偏移量 0.0（中心行）

## UI 布局

- **顶部栏**: 货物存储格（3 种商品：🍇🍷🍲）+ 标题 + 骰子 + 得分
- **中部**: 左侧资源面板（工人片👷、银币🪙）+ 中央六边形网格
- **底部**: 六角片仓库（3 个空位）+ 订单卷轴
- 版图容器 800px 宽，深色木质背景

## 如何修改

1. 改地形布局 → 编辑 `DATA` 数组中的 terrainKey（注意保持行对称性）
2. 改颜色 → 同时更新 CSS `.t-*` 的 `background` 和 JS `T` 中对应的 `dc`
3. 加骰子/标记 → 在 DATA 条目中添加 `dieValue` 和/或 `mark` 参数
4. 调整位置 → 修改 `BX` / `BY`（整体偏移）或 DATA 中的 `col` 值
5. 查看效果 → 浏览器打开 `board-game-mat.html`
6. 图片分析校准 → `node optimize_grid.js`
