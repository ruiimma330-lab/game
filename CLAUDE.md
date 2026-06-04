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
│   ├── board-game-mat.html                  # 唯一生产文件（单文件 HTML）
│   ├── ...分析脚本                          # Node.js/Python 六边形网格分析工具链
│   └── see player board/CLAUDE.md           # 详细坐标系统 & 修改指南
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

见 `player board/CLAUDE.md` 完整文档。核心要点：

- 单文件 HTML，CSS+JS 内联
- 37 个尖头六边形，`4-5-6-7-6-5-4` 布局
- 坐标系统：`cx = BX + c * W`，`cy = BY + r * VG`
- **当前 BX = 65**（已调整使标题与网格 X 中心对齐）

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
# 浏览器打开版图
start "player board/board-game-mat.html"

# 查看调研报告前 100 行
Get-Content "桌游调研报告.md" -TotalCount 100

# 生成幻灯片（workspace 目录下）
python generate_slides.py

# 校准六边形坐标（player board 目录下）
node optimize_grid.js

# 查看作业要求（需 python-docx）
pip install python-docx
python -c "import docx; doc = docx.Document(r'C:\Users\Administrator\Desktop\信息交互设计（实践课作业要求）.docx'); [print(p.text) for p in doc.paragraphs]"
```
