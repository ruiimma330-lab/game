# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**桌游设计调研项目**，为《信息交互设计》课程作业。目标是在市场调研和游戏机制拆解基础上，设计一款原创桌游。

作业分三部分：
1. **桌游店市场与用户体验生态现状** ✅ 已完成（含 PPT）
2. **3-5 款代表性桌游的深度交互设计调研** — 机制拆解、信息架构、交互可用性分析 ⏳
3. **设计切入点提炼与桌游构想** — 基于调研推导原创桌游概念 ⏳

## 目录结构

```
game/
├── 桌游调研报告.md                          # 8 款桌游全面调研
├── 第一部分_桌游店市场与用户体验生态现状.md   # 作业第一部分（可交付）
├── 第一部分_桌游店市场与用户体验生态现状.txt   # 同上，纯文本版
├── 勃艮第城堡规则与流程.md                  # 勃艮第城堡详细规则拆解
├── 信息交互设计（实践课作业要求）.docx        # 原始作业要求
│
├── player board/                            # 勃艮第城堡玩家版图 HTML 复刻
│   ├── board-game-mat.html                  # 玩家版图（单文件 HTML，CSS+JS 内联）
│   ├── center-board.html                    # 中心公共版图（单文件 SVG+JS）
│   ├── 35cd6588fd40ea9ab8d2601220114595.png # 玩家版图参考图
│   ├── ...分析脚本                          # Node.js/Python 六边形网格分析工具链
│   └── see player board/CLAUDE.md           # 玩家版图坐标系统 & 修改指南
│
└── workspace/                               # PPT 幻灯片生成
    ├── generate_slides.py                   # Python SVG 幻灯片生成（零依赖）
    └── svg_final/                           # 生成的 4 张 SVG 幻灯片
```

## 调研报告格式约定

所有 `.md` 报告文件遵循以下结构：
- 顶部 `---` 分隔的元信息区（数据来源、概述）
- 分节使用 `##`（一级）和 `###`（二级）标题
- 数据表格优先于文字描述
- 关键洞察用 **加粗** 或 `>` 引用标注
- 游戏名称出现在每节 `#` 标题中

## Subprojects

### 1. workspace/ — PPT 幻灯片生成

`generate_slides.py` 是一个零依赖的 Python SVG 生成器，架构如下：

- **模板层**: `chrome()` 函数生成统一幻灯片骨架（1280×720，含品牌栏、标题区、页脚）
- **页面层**: `page1()`~`page4()` 各自生成内容 SVG，拼接到模板中
- **输出**: 4 个独立 SVG 文件 → `svg_final/slide_01.svg` ~ `slide_04.svg`
- **设计令牌**：顶部硬编码色值（`C_PRIMARY = "#1677FF"` 等 CSS 变量风格）
- 不需要任何外部依赖，Python 标准库即可运行

### 2. player board/ — 勃艮第城堡版图复刻

含两个独立的单文件 HTML 页面：

#### board-game-mat.html（玩家版图）

见 `player board/CLAUDE.md` 完整文档。核心要点：

- 单文件 HTML，CSS+JS 内联
- 37 个尖头六边形，`4-5-6-7-6-5-4` 布局
- 坐标系统：`cx = BX + c * W`，`cy = BY + r * VG`
- **当前 BX = 65**（已调整使标题与网格 X 中心对齐）

#### center-board.html（中心公共版图）

SVG 内联于 HTML，JS 动态生成部分元素。viewBox `0 0 1140 810`。

**核心区域：**

| 区域 | 位置 | 说明 |
|------|------|------|
| 得分轨道 | 四周边缘 | JS 生成，1 分/格，~130 格，顺时针 |
| 阶段轨道 A-E | 顶部 y≈82 | 5 个彩色方块 + 区域奖励标注 |
| 轮次轨道 1-5 | 顶部 y≈84 | 5 个白色方框 |
| 6 个仓库 | 六角形分布 | 以黑市为中心，60° 间隔，R=218 |
| 黑市 | 中央 (570,430) | 8 个六边形，3-2-3 菱形排列 |
| 知识展示 | 右上 (880,150) | 8 个六边形格位（4 人局最大量） |
| 奖励板块 | 右下 | 区域预留 |
| 顺位轨道 | 底部 | 4 个玩家位置 |

**关键常量（JS 中）：**

```js
const CX=570, CY=430;     // 版图中心（黑市位置）
const R=218;               // 仓库到中心的半径
const CW=156, CH=136;      // 仓库卡片尺寸
const angles=[0, 60, 120, 180, 240, 300]; // 6 个仓库角度
```

**六边形渲染函数：** `hexPts(cx,cy,w,h)` — pointy-top，返回 SVG polygon points 字符串。

**得分轨道生成：** JS 计算 4 条边的位置（HP=30 水平间距，VP=24 垂直间距），顺时针从左上角开始。每 10 格加粗标注。

**交互：** `data-tip` 属性 + `mouseenter/mousemove/mouseleave` 事件实现 tooltip 悬浮提示。

## 分析脚本链（player board/）

从参考图片提取六边形位置的工具链按依赖顺序：

```
原始 PNG → analyze_grid.js（初始扫描）
         → find_hex_grid.js（六边形位置检测）
         → refine_grid.js（位置精调）
         → optimize_grid.js（参数优化, 依赖 pngjs）
         → scan_grid.js（最终验证）
```

- `analyze_board.py` — Python/Pillow 版图像分析（简易采样）
- `analyze_colors.js` — 各地形颜色提取
- `find_bounds.js` — 边界检测
- `hex_raw.js` — 原始六边形数据处理

## GitHub

- 远程仓库：`origin/main` → `github.com/ruiimma330-lab/game`
- 默认账号：**ruiimma330-lab**
- 推送：`git push -u origin main`

## 常用命令

```powershell
# 浏览器打开玩家版图
start "" "player board/board-game-mat.html"

# 浏览器打开中心公共版图
start "" "player board/center-board.html"

# 查看调研报告前 100 行
Get-Content "桌游调研报告.md" -TotalCount 100

# 生成幻灯片（workspace 目录下）
python generate_slides.py

# 校准六边形坐标（player board 目录下，需 pngjs）
cd "player board" && npm install && node optimize_grid.js

# 查看作业要求（需 python-docx）
pip install python-docx
python -c "import docx; doc = docx.Document(r'C:\Users\Administrator\Desktop\信息交互设计（实践课作业要求）.docx'); [print(p.text) for p in doc.paragraphs]"
```
