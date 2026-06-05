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

核心文件是 **`combined-board.html`**（单文件 HTML，CSS+JS 内联），同时包含中心公共版图和 4 个玩家版图。

#### combined-board.html 概览

| 组成部分 | 说明 |
|----------|------|
| 中心版图 | SVG 内联（viewBox `0 0 1140 810`），JS 动态生成得分轨道和仓库 |
| 4 个玩家版图 | JS 模板渲染，P1-P4 分别位于中心版图四周，0.65 缩放 + 旋转 |
| 演示系统 | 交互式流程演示，支持步骤/子步骤导航、缩放聚焦和高亮 |
| 拖拽 & 缩放 | Alt+左键拖拽平移 + 演示模式自动缩放 |

**玩家版图位置与旋转：**

| 玩家 | 位置 (left, top) | 旋转 | 标签色 |
|------|-------------------|------|--------|
| P1 | 880px, 1270px (下) | 0° | 红 #d32f2f |
| P2 | 1539px, 737px (右) | 270° | 蓝 #1976d2 |
| P3 | 880px, 233px (上) | 180° | 绿 #388e3c |
| P4 | 221px, 737px (左) | 90° | 橙 #f57c00 |

**关键尺寸：**
- 容器: 2400×1900px，初始 `transform: scale(0.8)`
- 中心版图: `left:700px, top:595px`, 1000px 宽
- 玩家版图: 640px 宽，`scale(0.65)` 显示
- 间隙: P1<P2 间距 ~40px, P1<中心 间距 ~20px

#### 玩家版图六边形网格

36 个格子（实际版图为 37 格），`4-5-6-7-6-5-4` 布局。见 `player board/CLAUDE.md` 完整坐标文档。

**地形配置（JS T 对象）：**

| 地形 | 图标 | CSS 类 | 渐变 |
|------|------|--------|------|
| pasture | 🌿 | `t-pasture` | 绿 |
| river | 🌊 | `t-river` | 蓝 |
| city | 🏙️ | `t-city` | 黄 |
| knowledge | 📚 | `t-knowledge` | 橙 |
| castle | 🏰 | `t-castle` | 红 |
| mine | ⛏️ | `t-mine` | 灰 |

#### 中心公共版图

SVG 内联于 HTML，JS 动态生成部分元素。

**核心区域：**

| 区域 | 位置 | 说明 |
|------|------|------|
| 得分轨道 | 四周边缘 | JS 生成，1 分/格，顺时针，从左上 START 开始 |
| 阶段 1-5 | 左侧 y≈80-590 | 5 个彩色方块 + 区域奖励标注（+10→+2） |
| 轮次 1-5 | 顶部 y≈84 | 5 个白色方框 |
| 6 个仓库 | 六角形分布 | 以黑市为中心，R=260，60° 间隔 |
| 黑市 | 中央 (570,430) | 8 个六边形，3-2-3 菱形排列 |
| 知识展示 | 右上 (925,339) | 8 个六边形格位 |
| 区域奖励 | 右下 (860,629) | 6 种区域完成奖励（城堡/船只/知识/矿场/动物/建筑） |
| 顺位轨道 | 底部偏上 | 4 个玩家顺位框 + 箭头指示 |

**关键常量：**
```js
const CX=570, CY=430;     // 版图中心（黑市位置）
const R=260;               // 仓库到中心的半径（2026-06 更新）
const CW=130, CH=104;      // 仓库卡片尺寸
const angles=[0,60,120,180,240,300]; // 6 仓库角度
```

**SVG ID（用于演示高亮）：**
- `#cb-phases` — 阶段 1-5
- `#cb-rounds` — 轮次 1-5
- `#cb-track` — 得分轨道
- `#cb-hex-area` — 仓库 + 黑市
- `#cb-know-hexes` — 知识展示
- `#cb-bonus-slots` — 区域奖励
- `#cb-turn-order` — 顺位轨道

#### 演示系统（流程演示）

入口: `▶ 流程演示` 按钮（fixed 右上角），点击后启动演示模式。

**6 步流程：**

| 步骤 | 内容 | 缩放 | 子步骤 |
|------|------|------|--------|
| 0 | 全景总览 | s=0.8 | — |
| 1 | 中心公共版图 | s=1.5 | 7 个子步骤（得分轨道→阶段轮次→仓库→黑市→知识奖励→顺位） |
| 2 | 全景过渡 | s=0.8 | — |
| 3 | P1 玩家版图 | s=2.0 | 6 个子步骤（版图→网格→资源→货物→骰子→仓库订单） |
| 4 | 游戏流程 | s=1.5 | 5 个子步骤（阶段轮次→仓库→顺位→放置→得分） |
| 5 | 总结 | s=0.8 | — |

**架构：**
- `goToStep(i)` — 跳转到主步骤
- `enterSubStep(idx)` — 进入子步骤，切换高亮 + 逐条显示字幕
- `nextStep()` / `prevStep()` — 导航，优先在子步骤间跳转
- `showLines(title, lines, cb)` — 逐条文字轮播（fadeInUp/fadeOut）
- `applyHL(sel)` / `clearHL()` — `filter:drop-shadow(0 0 12px rgba(255,215,0,.8))` 高亮

**子步骤机制：**
- 步骤数据中定义 `subSteps: [{lines: [...], hl: 'selector'}]`
- 子步骤不显示标题，只显示循环字幕
- 导航计数器显示 "n/N" 进度
- SVG 元素用 `#cb-svg .demo-highlight`（16px blur），HTML 元素用 `.demo-highlight`（12px blur）

**缩放与动画：**
- `container` 使用 `transform: translate(ox,oy) scale(zoomS)` 实现无级缩放
- `animateZoom(cx,cy,s)` 将容器坐标 `(cx,cy)` 映射到视口中心
- 公式: `ox = vw/2 - cx*s`, `oy = vh/2 - cy*s`
- CSS transition: `cubic-bezier(0.4,0,0.2,1)` 0.8s

**键盘控制：**
- `← →` / `Space`: 上下一步
- `Escape`: 结束演示

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
# 浏览器打开完整版图（主文件）
start "" "player board/combined-board.html"

# 浏览器打开独立版图
start "" "player board/board-game-mat.html"
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
