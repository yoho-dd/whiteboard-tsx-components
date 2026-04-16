# 概念原理图

> 概念原理图不是一种固定模板，而是一套**构图方法论**。用于绘制架构原理、系统设计方案、技术博客插图、论文配图等需要自由表达的专业图表。**用户说"架构"时大多数情况适合本模板**——因为他们通常想解释架构原理，而非枚举模块清单。

## 何时使用概念原理图

满足以下任一条件时，走概念原理图路径：

- 需要解释**架构原理、系统设计方案**（如微服务架构如何工作、缓存策略原理）
- 内容是解释**技术原理、机制、算法思想**（如 Attention 机制、GC 回收流程）
- 需要展示**数据流向、调用链路、处理管道**（如 RAG 系统、CI/CD 流水线）
- 需要**对比展示**两种方案/架构的内部差异（不是维度对比表）
- 需要展示**多路径汇合/分叉**的处理过程
- 需要**自由摆放分组卡片**来说明系统关系
- 用户要求"专业""论文风格""灵活布局""不要模板化"
- 信息结构不适合任何预定义图表类型

**不适合概念原理图的场景**（走对应模板）：
- 只需按层级枚举模块清单（"列出每层有什么"）→ `architecture.md`（分层线框图）
- 带判断分支的业务流程 → `flowchart.md`
- 维度×方案的对比矩阵 → `comparison.md`
- 组织树/汇报关系 → `organization.md`

---

## 方法论总览

概念原理图的构建分为 **5 个阶段**，每个阶段产出明确的中间产物：

```
概念分析 → 网格系统 → 组件设计 → 连线系统 → 两阶段渲染
  ↓           ↓          ↓          ↓           ↓
实体清单    行列坐标    节点JSON   connector   居中对齐的
+ 关系表    + 区域框    + 图标     + 锚点      最终 JSON
```

---

## 阶段 1：概念分析

在画任何东西之前，先产出两张清单：

**实体清单**（3-8 个核心实体）：
- 每个实体的名称、简短描述（≤ 6 字）、角色类型（处理模块/存储/外部实体/...）
- 标注主次：核心实体 vs 辅助实体

**关系表**：
- 每对关系的类型：数据流 / 依赖 / 包含 / 对比 / 时序
- 标注主次：关键路径 vs 普通关系 vs 可选路径

**确定整体走向**：

| 要表达的关系 | 走向 | 说明 |
|-------------|------|------|
| 处理流 / 数据管道 | **左→右** | 时间顺序从左到右 |
| 抽象层次 / 技术栈 | **下→上** | 底层在下，上层在上 |
| 架构总览 | **中心发散** | 核心在中间 |
| 方案对比 | **左右并列** | 各占一半画布 |

---

## 阶段 2：网格系统

> 核心方法：**先定行列网格，再放节点**。所有节点的位置由网格公式计算，不手写坐标。

### 2.1 行定义（中轴线对齐法）

每行定义一条**垂直中轴线 `centerY`**。同行所有节点的垂直中心对齐到这条线：

```
y = centerY - nodeHeight / 2
```

由于 `height: "fit-content"` 的实际高度在渲染前未知，需要**两阶段渲染**（见阶段 5）。

行间距至少 120px（标题行除外），确保纵向连线 label 有空间。

```javascript
const ROW = {
  title: 25,       // 标题行
  index: 135,      // 辅助行
  main:  320,      // 主管道行
  store: 520,      // 存储行
};
```

### 2.2 列定义（等距列公式）

同行节点**统一宽度**，用公式生成等距列坐标：

```javascript
const W = { main: 180, small: 140, wide: 220 };  // 同行统一宽度，核心节点可用 wide
const HGAP = 70;  // 横向间距（有连线 label 时必须 >= 60）

// 生成 n 列坐标
const col = (startX, w, n) => Array.from({ length: n }, (_, i) => startX + i * (w + HGAP));
const mainCols = col(50, W.main, 7);  // [50, 280, 510, 740, ...]
```

**关键约束**：
- 同行节点宽度必须相同（不同行可以不同）
- 横向间距统一，有连线 label 时 >= 60px
- 文字不能换行：标题 + 描述的长度必须在 `(宽度 - icon - padding - gap)` 内放得下

### 2.3 区域框

区域框（虚线分组框）基于覆盖的列范围计算边界：

```javascript
const REGION_PAD = 20;

function regionBounds(cols, nodeW, count, startIdx = 0) {
  const x = cols[startIdx] - REGION_PAD;
  const w = cols[startIdx + count - 1] + nodeW - cols[startIdx] + REGION_PAD * 2;
  return { x, w };
}
```

**区域标题不能与节点重叠**。标题悬浮在框上方：

```javascript
// 标题用 y: -20 悬浮在区域框上边缘外侧
{ type: 'text', x: 6, y: -20,
  width: 'fit-content', height: 'fit-content',
  text: label, fontSize: 13, textColor: color.border }
```

---

## 阶段 3：组件设计

### 3.1 卡片设计

概念原理图的节点遵循 `schema.md`「复合卡片」的设计原则，内部结构根据信息量自由组合。概念原理图的克制感通过**配色**（极简/经典色板）和**间距**来保证，不限制卡片内部结构。

**基础卡片** — 信息简单的节点：

```json
{
  "type": "frame", "id": "encoder", "x": 280, "y": 300,
  "width": 180, "height": "fit-content",
  "layout": "horizontal", "gap": 10, "padding": [10, 14],
  "alignItems": "center",
  "fillColor": "#FFFFFF", "borderColor": "#5178C6",
  "borderWidth": 2, "borderRadius": 10,
  "children": [
    { "type": "icon", "name": "code", "width": 28, "height": 28, "color": "#5178C6" },
    {
      "type": "frame", "layout": "vertical", "gap": 2, "padding": 0,
      "width": "fill-container", "height": "fit-content",
      "children": [
        { "type": "text", "width": "fill-container", "height": "fit-content",
          "text": "Encoder", "fontSize": 14, "textColor": "#1F2329", "textAlign": "left" },
        { "type": "text", "width": "fill-container", "height": "fit-content",
          "text": "问题向量化", "fontSize": 13, "textColor": "#646A73", "textAlign": "left" }
      ]
    }
  ]
}
```

**丰富卡片** — 核心节点或信息量大的节点，可使用更宽的尺寸（`W.wide`）和更深的结构：

```json
{
  "type": "frame", "id": "retriever", "x": 510, "y": 280,
  "width": 220, "height": "fit-content",
  "layout": "vertical", "gap": 0, "padding": 0,
  "fillColor": "#FFFFFF", "borderColor": "#5178C6",
  "borderWidth": 2, "borderRadius": 10,
  "children": [
    { "type": "frame", "layout": "horizontal", "gap": 8, "padding": [8, 12],
      "alignItems": "center", "fillColor": "#F0F4FC", "borderRadius": 10,
      "children": [
        { "type": "icon", "name": "database-search", "width": 24, "height": 24, "color": "#5178C6" },
        { "type": "text", "width": "fit-content", "height": "fit-content",
          "text": [{"content": "Retriever", "bold": true, "fontSize": 14}], "textColor": "#1F2329" }
      ]
    },
    { "type": "frame", "layout": "vertical", "gap": 4, "padding": [8, 12],
      "children": [
        { "type": "text", "width": "fill-container", "height": "fit-content",
          "text": "向量检索 + BM25 混合", "fontSize": 11, "textColor": "#646A73", "textAlign": "left" },
        { "type": "frame", "layout": "horizontal", "gap": 4, "padding": 0, "children": [
          { "type": "frame", "layout": "horizontal", "padding": [2, 6],
            "fillColor": "#F0F4FC", "borderColor": "#5178C6", "borderWidth": 1, "borderRadius": 4,
            "children": [
              { "type": "text", "text": "Top-K=5", "fontSize": 10, "width": "fit-content", "height": "fit-content", "textColor": "#5178C6" }
            ]}
        ]}
      ]
    }
  ]
}
```

根据信息需要，自由决定每个节点的复杂度。同行内节点宽度仍需统一（都用 `W.main` 或都用 `W.wide`），不同行之间可以不同。

**图标选取**：运行 `DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js --icons` 查看可用图标。常用映射：

| 概念 | 图标名 |
|------|--------|
| 用户/查询 | search |
| 编码/代码 | code |
| 数据库/存储 | database / database-search |
| AI/模型 | bot / chip |
| 设置/处理 | settings / configuration |
| 文档 | document / folder |
| 目标/输出 | target |
| 连接/融合 | connect / link |
| 网络/API | api / network-node |
| 服务器 | server / cloud-storage |

**文字长度约束**：icon 28px + gap 10px + padding 28px → 文字可用宽度 ≈ `nodeWidth - 66px`。180px 节点 → 114px 可用 → 14px 字号约 8 个汉字。使用 `W.wide`（220px）时可用 154px。超出则缩短文案或换行拆分。

### 3.2 区域框样式

```json
{
  "fillColor": "#F0F4FC",
  "borderColor": "#5178C6",
  "borderWidth": 1.5,
  "borderDash": "dashed",
  "borderRadius": 14
}
```

### 3.3 配色策略

按**语义路径**分配颜色（从 `style.md` 色板选取），不按层级：

```
路径 A（如查询路径）：border #5178C6，fill #F0F4FC
路径 B（如生成路径）：border #509863，fill #DFF5E5
路径 C（如存储路径）：border #8569CB，fill #EAE2FE
```

- 节点：白底 + 路径色边框
- 区域框：路径色浅底 + 路径色虚线边框
- 图标 `color`：跟随所属路径的 borderColor

---

## 阶段 4：连线系统

### 4.1 锚点必须显式指定

概念原理图用绝对定位，引擎无法推断方向。**每条连线都必须写 `fromAnchor` 和 `toAnchor`**：

| 相对位置 | fromAnchor | toAnchor |
|---------|------------|----------|
| 目标在正右方 | right | left |
| 目标在正下方 | bottom | top |
| 目标在右下方 | bottom | top |
| 逆流/反馈 | top | bottom |
| 远距离绕行 | top | top |

### 4.2 语义线型

| 语义 | lineWidth | lineColor | lineStyle | endArrow |
|------|-----------|-----------|-----------|----------|
| 关键数据流 | 2.5 | 路径主题色 | solid | arrow |
| 普通依赖 | 1.5 | #BBBFC4 | solid | arrow |
| 可选/反馈 | 1.5 | #BBBFC4 | dashed | arrow |
| 双向交互 | 2 | #BBBFC4 | solid | 两端 arrow |

### 4.3 连线标注

- 用 `label` 标注传递内容（2-6 字）
- 多条平行线用 `labelPosition` 错开（0.3 / 0.5 / 0.7）
- 连线数量不限，但不能交叉

---

## 阶段 5：两阶段渲染

`height: "fit-content"` 的实际高度渲染前未知，必须两阶段：

```javascript
const CLI = 'DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js';

// 阶段 1：临时渲染，获取各节点实际高度（pass1 是中间产物，不是正式版本）
const pass1 = { version: 2, nodes: [...buildNodes(null), ...buildConnectors()] };
fs.writeFileSync('diagram_v1.json', JSON.stringify(pass1, null, 2));
execSync(`${CLI} -i diagram_v1.json -o diagram_v1.png -l coords.json 2>&1`);
const coords = JSON.parse(fs.readFileSync('coords.json', 'utf-8'));

// 阶段 2：用实际高度，按中轴线对齐法重新计算 y → 输出为 v1（首个正式版本）
const pass2 = { version: 2, nodes: [...buildNodes(coords), ...buildConnectors()] };
fs.writeFileSync('diagram_v1.json', JSON.stringify(pass2, null, 2));
execSync(`${CLI} -i diagram_v1.json -o diagram_v1.png 2>&1`);
// 审视 diagram_v1.png，如需修改则输出 diagram_v2.json / diagram_v2.png，不覆盖 v1
```

`buildNodes(coords)` 内用中轴线公式定位：
```javascript
const cy = (centerY, id) => {
  const h = coords[id] && coords[id].height;
  return h ? Math.round(centerY - h / 2) : centerY;
};
// 每个节点：y = cy(ROW.main, 'nodeId')
```

---

## 常见构图模式

以下模式是**可组合的视觉手法**，不是固定模板。

### 模式 A: Pipeline（处理管道）

横向排列的处理阶段。适合数据处理流、CI/CD、请求链路。

```
[Input] ──→ [Stage A] ──→ [Stage B] ──→ [Output]
                 │              ↑
            [Side Process] ────┘
```

- 主轴线左→右，核心阶段在同一行
- 旁路/分支另起一行
- 用连线 label 标注传递内容

### 模式 B: 内部展开（Zoom-in）

外层大框表示系统边界，内部展开子组件。

```
┌─── System ──────────────────────┐
│  [Module A] ───→ [Module B]     │
└─────────────────────────────────┘
```

- 外层 frame 浅色填充 + 实线边框
- 内部组件白底 + 彩色边框
- 可嵌套多层

### 模式 C: 多路径汇合 / 分叉

多个输入汇合到一个节点，或一个输入分叉。

```
[Image] ──→ [CNN]    ──┐
                        ├──→ [Fusion] → [Output]
[Text]  ──→ [BERT]   ──┘
```

- 各路径纵向错开，水平对齐处理阶段
- 不同路径用不同颜色

### 模式 D: 并列对比（Side-by-side）

两个独立子图并排，各自有内部结构。

```
  (a) Baseline          (b) Ours
┌──────────────┐    ┌──────────────┐
│  内部结构 A   │    │  内部结构 B   │
└──────────────┘    └──────────────┘
```

- 左右各占一半画布，中间留 80-100px
- 顶部各自有标签

### 模式 E: 自由分组（Grouped Cards）

若干卡片组散布在画布上，位置表达逻辑关系。

```
┌╌╌ Region A ╌╌┐
╎ [Card] [Card] ╎──→ [Card]
└╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘
```

- 虚线框圈出相关卡片
- 位置接近 = 关系紧密
- 连线只画关键依赖

**模式可自由组合**：Pipeline 某阶段用 Zoom-in 展开，Side-by-side 每个子图是一个 Pipeline。

---

## 渲染前自查

- [ ] 同行节点宽度统一？高度一致（文字未换行）？
- [ ] 节点间距 >= 60px（有 label 时）？
- [ ] 标题与内容不重叠？区域标题与节点不重叠？
- [ ] 每个节点有图标？图标 color 跟随路径色？
- [ ] 每条连线写了 fromAnchor + toAnchor？
- [ ] 关键路径用粗彩色线，普通关系用细灰线？
- [ ] connector 在根 nodes 数组？height 用 fit-content？
