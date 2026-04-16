# DSL Schema

> 本文件只说明 **DSL 里能写什么**：节点类型、字段、枚举值、硬约束。布局策略、组合方法、Dagre/Flex 心智模型统一放在 `references/layout.md`。  
> `?` 表示该字段在 schema 层是 optional；若需要稳定产出，再参考对应 scene 或 layout 文件中的最佳实践。

**📝 布局引擎核心法则**：
- **基本行为与 Flexbox 等同**：Frame 布局基于 Yoga 引擎。`layout: 'horizontal'` = `flex-direction: row`，`fill-container` = `flex: 1`，`fit-content` = `width: auto`，`gap` / `padding` / `alignItems` / `justifyContent` 语义相同。
- **枚举值无 flex- 前缀**：一律使用 `'start'` / `'end'` 而非原生 CSS 的 `'flex-start'` / `'flex-end'`。
- **默认对齐的差异**：`alignItems` 的默认值是 `'start'`（原生 CSS 默认是 `stretch`）。所以同排卡片需要等高时，**必须显式声名** `alignItems: 'stretch'`。
- **Dagre 引擎的特殊性**：`layout: 'dagre'` 作为专属拓扑连线引擎，自身不支持 `fill-container` 宽高，对其父容器而言，它是一个自适应（打包裹）的黑盒。

## WBDocument

```typescript
interface WBDocument {
  version: 2;
  nodes: WBNode[];   // 顶层节点。connector 必须放在这里，不能嵌套在 children 中
}
```

## 节点类型

### Frame（容器）

唯一可以包含子节点的类型。用于分组、布局、背景。

```typescript
{
  type: 'frame';
  id?: string;
  x?: number; y?: number;       // Flex 子节点不需要 x/y
  width: WBSizeValue;
  height: WBSizeValue;
  layout: 'horizontal' | 'vertical' | 'none' | 'dagre';  // 布局模式
  gap: number;                    // 必须显式写（不写节点会粘连，容易出 bug）
  padding: number | [number, number] | [number, number, number, number]; // 必须显式写（不写内容贴边）
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  layoutOptions?: {                 // 仅当 layout 为 'dagre' 时生效
    rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
    nodesep?: number;
    edgesep?: number;
    ranksep?: number;
    edges?: Array<[string, string] | [string, string, string]>; // [fromId, toId, label?] 引擎自动排版子节点并生成贝塞尔曲线连线
    isCluster?: boolean;            // 透明子图。为 true 时子节点参与父级 Dagre 拓扑运算，连线可穿越边界
    clusterTitle?: string;          // 子图悬浮标题（自动吸附左上角）
    clusterTitleColor?: string;     // 标题颜色 (HEX格式，如 "#8B5CF6")
  };
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  children?: WBNode[];           // 不能包含 connector
}
```

**Dagre 嵌套排版规则**：

1. **不透明节点（Opaque Node）**：Dagre 内的子容器，无论 `layout` 是 `flex`、`absolute` 还是 `dagre`，只要未声明 `isCluster: true`，对外层 Dagre 就是具有确定宽高的不透明原子节点。外层连线无法寻址其内部子节点。
2. **连线兜底重定向（Edge Redirect Fallback）**：当 `edges` 引用了某不透明节点内部的子节点 ID 时，引擎自动将该连线端点重定向至其最近的不透明祖先节点。不报错，不产生悬空连线。
3. **透明子图（Compound Cluster）**：子容器同时声明 `layout: "dagre"` 与 `layoutOptions: { isCluster: true }` 时，成为外层 Dagre 的复合子图。其内部子节点直接参与外层拓扑运算，连线可穿越子图边界。子图自身不执行独立排版，尺寸由外层 Dagre 根据内部节点包围盒自动撑开。

**isCluster 最小用法**：
```json
{
  "type": "frame", "id": "cluster_a",
  "layout": "dagre", "layoutOptions": { "isCluster": true },
  "fillColor": "#F0FDF4", "borderColor": "#86EFAC", "borderWidth": 2, "borderDash": "dashed", "borderRadius": 16,
  "children": [
    { "type": "text", "text": "区域标题", "fontSize": 11, "textColor": "#15803D" },
    { "type": "rect", "id": "node_inside", "width": 120, "height": 40, "text": "内部节点" }
  ]
}
```
> 注意：`edges` 必须写在**最外层的根 Dagre** 的 `layoutOptions` 中，不要写在 cluster 内部。
**其他约束**：
- `layout / gap / padding` 在 schema 层是 optional，但实际生成时推荐显式写出，避免依赖默认行为。
- `layoutOptions` 仅在 `layout: 'dagre'` 时生效。
- `children` 里不能出现 `connector`。

> **虚拟 frame 陷阱**：没有 `fillColor`、`borderColor`、`borderWidth` 的 frame 在编译时可能被当作纯布局容器跳过（子节点直接提升到父级）。如果给这种 frame 设了 `id` 并让外部 connector 连接它，编译后 frame 消失，connector 引用会失效。需要保留这个 frame 时，请给它加上不会被优化掉的外观属性。

### 基础图形

```typescript
{
  type: 'rect' | 'ellipse' | 'cylinder' | 'diamond' | 'triangle' | 'trapezoid';
  // ⚠️ ellipse 仅用于纯几何图形（飞轮圆、数据点标记等无文字场景）。
  // 需要带文字的椭圆/圆形节点时，改用胶囊 frame（见下方「胶囊节点」）。
  id?: string;
  x?: number; y?: number;
  opacity?: number;              // 0-1，仅影响 fillColor 的透明度（对 frame/text/stickyNote 无效）
  vFlip?: boolean;
  hFlip?: boolean;
  width: WBSizeValue;
  height: WBSizeValue;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  topWidth?: number;             // 仅对 triangle / trapezoid 有效，梯形顶边宽度或三角形顶角截断宽度
  text?: string | WBTextRun[];   // 纯文本或富文本
  fontSize?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';     // Shape 默认 'center'（与 CSS 不同）
  verticalAlign?: 'top' | 'middle' | 'bottom';  // Shape 默认 'middle'（与 CSS 不同）
}
```

> **cylinder 约束**：cylinder 的弧度固定 16px，不随宽度缩放。宽度过大会变成扁椭圆。禁止 `width: "fill-container"`，必须用固定宽度 + `height: "fit-content"`。宽度根据文字长度选择，通常 120-200px。

> **Shape 内边距（TEXT_INSET）**：Shape 节点有强制内边距，fit-content 会自动补偿。
> - rect / ellipse / diamond / triangle：上下左右各 12px
> - cylinder：顶部弧形 32px + 底部弧形 10px（垂直 +42px），水平各 7px
>
> 需要手算固定尺寸时：`实际文字宽/高 + 对应 inset`。
> 例：rect 内 14px 字号两行文字高 ~32px → `height >= 32 + 24 = 56px`

### Text（纯文本节点）

```typescript
{
  type: 'text';
  id?: string;
  x?: number; y?: number;
  width: WBSizeValue;
  height: WBSizeValue;
  text?: string | WBTextRun[];
  fontSize?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}
```

### StickyNote（便签）

```typescript
{
  type: 'stickyNote';
  id?: string;
  x?: number; y?: number;
  width: WBSizeValue;
  height: WBSizeValue;
  fillColor?: '#FEF1CE' | '#F5D1A7' | '#DFF5E5' | '#CDF7CC' | '#C9E8EF' | '#D6DCF3' | '#D3CCEE' | '#F1C5E7' | '#F6C8C8'; // 便签底色（仅支持这 9 种）
  text?: string | WBTextRun[];
  fontSize?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}
```

### Connector（连线）

必须放在顶层 `nodes` 数组中，不能嵌套在 frame 的 `children` 里。

```typescript
{
  type: 'connector';
  id?: string;
  connector: {
    from: string | { x: number; y: number };   // 节点 id 或坐标
    to:   string | { x: number; y: number };
    fromAnchor?: 'top' | 'right' | 'bottom' | 'left';
    toAnchor?:   'top' | 'right' | 'bottom' | 'left';
    lineShape?:  'straight' | 'polyline' | 'curve' | 'rightAngle'; // 直线、圆角折线、曲线、直角折线
    lineColor?: string;
    lineWidth?: number;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    startArrow?: 'none' | 'arrow' | 'triangle' | 'circle' | 'diamond';
    endArrow?:   'none' | 'arrow' | 'triangle' | 'circle' | 'diamond';
    waypoints?: { x: number; y: number }[];  // polyline 途经点
    label?: string;                          // 连线中间的标签文字
    labelPosition?: number;                  // 标签位置，0-1，默认 0.5（中点）
  };
}
```

### SVG

```typescript
{
  type: 'svg';
  id?: string;
  x?: number; y?: number;
  opacity?: number;
  width: WBSizeValue;
  height: WBSizeValue;
  svg: { code: string };         // SVG 代码字符串
}
```

#### 渲染规范

SVG 通过 `image/svg+xml` Blob 加载到画布，**不在 HTML DOM 中**，因此存在严格限制：

**必须**：
- 包含 `viewBox` 属性（如 `viewBox="0 0 24 24"`），引擎依赖它确定坐标系
- 包含 `xmlns="http://www.w3.org/2000/svg"`（SVG 作为独立 `image/svg+xml` 解析时，XML 规范要求声明命名空间）

**允许的元素**（纯几何绘制）：
- 基本图形：`<rect>` `<circle>` `<ellipse>` `<line>` `<polyline>` `<polygon>` `<path>`
- 渐变/滤镜：`<defs>` `<linearGradient>` `<radialGradient>` `<filter>` `<feGaussianBlur>` `<feMerge>`
- 结构：`<g>` `<clipPath>` `<mask>` `<use>`

**禁止的元素**（字体和外部资源在 Blob 沙箱中无法加载）：
- `<text>` `<tspan>`（用同层 DSL rect 节点 + text 属性替代）
- `<image>`（用同层 DSL image 节点替代）
- `<foreignObject>`
- 任何引用外部 URL 的属性（`xlink:href` 指向远程资源等）

#### 两种典型用法

**1. 背景装饰 SVG**（大尺寸，与 frame 同大小）

用于绘制连线、曲线、发光效果等几何背景。文字信息通过同一 frame 内的 rect 节点叠加：

```json
{
  "type": "frame", "width": 1400, "height": 680, "layout": "none",
  "children": [
    { "type": "svg", "x": 0, "y": 0, "width": 1400, "height": 680,
      "svg": { "code": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1400 680\" ...>...</svg>" } },
    { "type": "rect", "x": 100, "y": 50, "width": 200, "height": 40,
      "text": "Label", "fillColor": "transparent" }
  ]
}
```

**2. 内联图标 SVG**（24-48px，Feather/Lucide 风格）

用于卡片/按钮中的小图标，纯 stroke 线条：

```json
{ "type": "svg", "width": 32, "height": 32,
  "svg": { "code": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3B82F6\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>" } }
```

### Icon（内置图标）

引用画板内置图标库的图标。比手写 SVG 更简单——只需指定 `name`。

```typescript
{
  type: 'icon';
  id?: string;
  x?: number; y?: number;
  width?: WBSizeValue;          // 默认 48
  height?: WBSizeValue;         // 默认 48，保持正方形
  name: string;                 // 图标名称，从 DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js --icons 输出中选取
  color?: string;               // 可选颜色覆盖，hex 格式如 '#FF6600'
}
```

**获取可用图标**：规划好内容和布局后，运行以下命令查看所有可用图标名，从中选取：
```bash
DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js --icons
```

用法：
```json
{ "type": "icon", "id": "db", "name": "database", "width": 48, "height": 48 }
```

**使用建议**：
- **所有代表具体事物的节点都应使用图标**（服务、数据库、用户、设备、工具等），只有纯布局容器和文字标签不需要图标
- 用 `color` 为图标指定与所在分组 `borderColor` 一致的颜色
- 图标可放在 frame 子元素中参与 flex 布局，连线可通过 id 连接到图标
- **优先使用下方的复合卡片模式**，而非单独的 icon + text 简单组合

### 胶囊节点（Capsule Node）— 替代 ellipse 的内容节点

**需要圆润外形的带文字节点时（流程图起终点、外部实体、鱼骨图鱼头等），使用全圆角 frame 而非 ellipse。** 胶囊形状空间利用率高、排列整齐，ellipse 则空间浪费且难以对齐。

```json
{
  "type": "frame", "id": "start", "layout": "horizontal",
  "padding": [8, 24], "alignItems": "center", "justifyContent": "center",
  "fillColor": "#F0F4FC", "borderColor": "#5178C6",
  "borderWidth": 1, "borderRadius": 999,
  "children": [
    { "type": "text", "width": "fit-content", "height": "fit-content",
      "text": [{ "content": "开始", "bold": true, "fontSize": 14 }], "textColor": "#1F2329" }
  ]
}
```

- `borderRadius: 999` 使短边完全圆弧，形成胶囊/药丸形状
- 可在 children 中加 icon，变成带图标的胶囊卡片
- **ellipse 只保留给纯几何用途**（飞轮图的圆形、折线图数据点等不含文字的场景）

---

### 复合卡片（Composite Card）

代表具体事物的内容节点（服务、模块、数据库、用户角色等）应使用 frame 复合卡片，而非纯文本 rect。纯 rect 仅用于对比表格数据单元格、纯文字标签等信息密度极低的场景。

> **🔴 连线 ID 规则**：`id` 只设置在卡片**最外层 frame** 上，**卡片内部子元素（icon、text、badge）不要设置 id**。连线的 `from`/`to` 和 Dagre 的 `edges` 必须引用外层 frame 的 id，否则连线会错误地连到卡片内部的某个小元素上，而非整张卡片。

#### 设计原则

卡片内部结构不限定固定模板，根据信息特征自由组合。但好的卡片应满足以下原则：

| 原则 | 说明 |
|------|------|
| **层次对比** | 卡片内至少 2 层视觉重量差异——字号差 ≥ 4px、粗细对比、或颜色明暗对比 |
| **信息密度匹配** | 卡片复杂度匹配它承载的信息量。一句话的节点不需要 5 层结构；有 4 个属性的节点不该只显示标题 |
| **内部留白** | 不同语义的信息块之间用 gap / padding 分隔，不要所有内容挤在一起 |
| **外轮廓统一** | 同组卡片外形一致（宽度、圆角、边框），并排时视觉对齐 |

#### 构成能力

一张卡片的外层是 frame，内部可自由组合：

- **文字层级** — 通过 fontSize / bold / textColor 组合形成主标题、副标题、描述、数据等任意层次
- **图标** — icon 或 svg，任意尺寸，可放顶部居中、左侧对齐、行内嵌入等任意位置
- **标签 (Badge)** — frame 包裹 text（`padding: [2, 8]`, `borderRadius: 4`），可单个或多个并排。不要用 rect 做标签（rect 内边距固定 12px 无法紧凑）
- **嵌套容器** — frame 内再嵌 frame，实现分栏、分行、卡中卡、子项列表
- **几何装饰** — rect 做分隔线（`height: 1, fillColor: "#DEE0E3"`）、色块；cylinder 做数据库图示
- **富文本** — WBTextRun 数组实现同行内粗细 / 颜色混排、有序 / 无序列表
- **有色头部** — 卡片顶部 frame 加 fillColor 形成色彩头部区域，与下方白色内容区形成层次

#### 示范光谱

以下示例展示卡片可以有多大的结构差异。**这不是全部可能性**，根据信息特征自由设计。

**轻量节点** — 信息简单时，icon + 标题 + 副标题即可：

```json
{
  "type": "frame", "layout": "horizontal", "gap": 10, "padding": [10, 16],
  "alignItems": "center", "fillColor": "#FFFFFF", "borderColor": "#C2D3EE",
  "borderWidth": 1, "borderRadius": 10,
  "children": [
    { "type": "icon", "name": "code", "width": 28, "height": 28, "color": "#5178C6" },
    { "type": "frame", "layout": "vertical", "gap": 2, "padding": 0, "children": [
      { "type": "text", "width": "fit-content", "height": "fit-content",
        "text": [{"content": "Encoder", "bold": true, "fontSize": 13}], "textColor": "#1F2329" },
      { "type": "text", "width": "fit-content", "height": "fit-content",
        "text": "问题向量化", "fontSize": 10, "textColor": "#646A73" }
    ]}
  ]
}
```

**带色头部的服务卡** — 需要分区辨识度时，顶部用分组浅色做 header：

```json
{
  "type": "frame", "layout": "vertical", "gap": 0, "padding": 0,
  "fillColor": "#FFFFFF", "borderColor": "#C2D3EE", "borderWidth": 1, "borderRadius": 10,
  "children": [
    { "type": "frame", "layout": "horizontal", "gap": 8, "padding": [8, 12],
      "alignItems": "center", "fillColor": "#F0F4FC", "borderRadius": 10,
      "children": [
        { "type": "icon", "name": "settings", "width": 24, "height": 24, "color": "#5178C6" },
        { "type": "text", "width": "fit-content", "height": "fit-content",
          "text": [{"content": "订单服务", "bold": true, "fontSize": 14}], "textColor": "#1F2329" }
      ]
    },
    { "type": "frame", "layout": "horizontal", "gap": 6, "padding": [6, 12], "children": [
      { "type": "frame", "layout": "horizontal", "padding": [2, 8],
        "fillColor": "#F0F4FC", "borderColor": "#5178C6", "borderWidth": 1, "borderRadius": 4,
        "children": [
          { "type": "text", "text": "Go", "fontSize": 10, "width": "fit-content", "height": "fit-content", "textColor": "#5178C6" }
        ]},
      { "type": "frame", "layout": "horizontal", "padding": [2, 8],
        "fillColor": "#F0F4FC", "borderColor": "#5178C6", "borderWidth": 1, "borderRadius": 4,
        "children": [
          { "type": "text", "text": "gRPC", "fontSize": 10, "width": "fit-content", "height": "fit-content", "textColor": "#5178C6" }
        ]}
    ]},
    { "type": "frame", "layout": "vertical", "gap": 4, "padding": [6, 12, 10, 12], "children": [
      { "type": "text", "width": "fill-container", "height": "fit-content",
        "text": "订单创建 · 支付 · 库存扣减", "fontSize": 10, "textColor": "#646A73" }
    ]}
  ]
}
```

**指标卡** — 需要突出关键数字时，大号数字 + 趋势标签：

```json
{
  "type": "frame", "layout": "vertical", "gap": 8, "padding": [16, 20],
  "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 10,
  "width": "fill-container", "height": "fit-content",
  "children": [
    { "type": "text", "width": "fill-container", "height": "fit-content",
      "text": [{"content": "月活跃用户", "bold": true, "fontSize": 13}], "textColor": "#646A73" },
    { "type": "text", "width": "fit-content", "height": "fit-content",
      "text": [{"content": "1,280,000", "bold": true, "fontSize": 28}], "textColor": "#1F2329" },
    { "type": "frame", "layout": "horizontal", "gap": 8, "padding": 0, "alignItems": "center",
      "children": [
        { "type": "frame", "layout": "horizontal", "padding": [2, 8],
          "fillColor": "#DFF5E5", "borderColor": "#509863", "borderWidth": 1, "borderRadius": 4,
          "children": [
            { "type": "text", "text": "↑ 12.5%", "fontSize": 10, "width": "fit-content", "height": "fit-content", "textColor": "#509863" }
          ]},
        { "type": "text", "text": "较上月", "fontSize": 10, "width": "fit-content", "height": "fit-content", "textColor": "#8F959E" }
      ]}
  ]
}
```

**聚合卡** — 多个同类子项收纳在一张卡中，减少同级节点数量：

```json
{
  "type": "frame", "layout": "vertical", "gap": 8, "padding": [12, 16],
  "fillColor": "#FFFFFF", "borderColor": "#C2D3EE", "borderWidth": 1, "borderRadius": 10,
  "children": [
    { "type": "frame", "layout": "horizontal", "gap": 8, "padding": 0, "alignItems": "center",
      "children": [
        { "type": "icon", "name": "database", "width": 24, "height": 24, "color": "#5178C6" },
        { "type": "text", "width": "fit-content", "height": "fit-content",
          "text": [{"content": "缓存集群", "bold": true, "fontSize": 14}], "textColor": "#1F2329" }
      ]},
    { "type": "frame", "layout": "vertical", "gap": 4, "padding": 0, "children": [
      { "type": "frame", "layout": "horizontal", "gap": 8, "padding": [4, 8], "alignItems": "center",
        "fillColor": "#F8F9FA", "borderRadius": 6,
        "children": [
          { "type": "text", "width": 70, "height": "fit-content",
            "text": [{"content": "Redis", "bold": true, "fontSize": 11}], "textColor": "#1F2329" },
          { "type": "text", "width": "fit-content", "height": "fit-content",
            "text": "会话缓存 · 热点数据", "fontSize": 10, "textColor": "#646A73" }
        ]},
      { "type": "frame", "layout": "horizontal", "gap": 8, "padding": [4, 8], "alignItems": "center",
        "fillColor": "#F8F9FA", "borderRadius": 6,
        "children": [
          { "type": "text", "width": 70, "height": "fit-content",
            "text": [{"content": "Memcached", "bold": true, "fontSize": 11}], "textColor": "#1F2329" },
          { "type": "text", "width": "fit-content", "height": "fit-content",
            "text": "计数器 · 排行榜", "fontSize": 10, "textColor": "#646A73" }
        ]}
    ]}
  ]
}
```

#### 节点聚合策略

当同一层级内节点过多时，应通过聚合减少视觉噪音：

| 同级节点数 | 处理方式 |
|-----------|---------|
| 1-4 个 | 直接平铺 |
| 5-7 个 | 按职责或类型分 2-3 组，用分组容器或聚合卡收纳 |
| 8+ 个 | 必须分组；或将次要节点合并为"xxx 等 N 个服务"聚合节点 |

聚合方式：
- **分组容器**：用带浅色背景的 frame 包裹一组相关节点，加分组标题
- **聚合卡**：一张卡片内列出多个子项（如上方"缓存集群"示例）
- **主从结构**：一个大卡片表示核心服务，内嵌子卡片展示附属组件

---

## 富文本 WBTextRun

`text` 字段可以是纯字符串或 `WBTextRun[]` 数组。类似 HTML 内联样式：bold 对应 `<b>`，italic 对应 `<i>`，listType 对应 `<ol>/<ul>`。每个 run 是一段带样式的文字：

```typescript
interface WBTextRun {
  content: string;               // 文字内容，可含 \n 换行
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikeThrough?: boolean;
  fontSize?: number;
  color?: string;                // 文字颜色
  backgroundColor?: string;     // 文字高亮背景
  hyperlink?: string;
  listType?: 'none' | 'ordered' | 'unordered';
  indent?: number;               // 缩进级数
  quote?: boolean;               // 引用块
}
```

示例：

```json
{
  "text": [
    { "content": "标题文字\n", "bold": true, "fontSize": 16 },
    { "content": "正文内容，", "fontSize": 14 },
    { "content": "高亮部分", "backgroundColor": "#FEF1CE", "fontSize": 14 }
  ]
}
```

`text` 和 `content` 中出现的双引号必须写成 `\"`，这是 JSON 规范要求。换行用 `\n`（JSON 中写为 `"第一行\n第二行"`，不要双重转义为 `\\n`）。

---

## 尺寸值 WBSizeValue

| 值                    | 含义                        | 注意                                   |
| --------------------- | --------------------------- | -------------------------------------- |
| `number`              | 固定像素                    | 任何场景                               |
| `'fit-content'`       | 由内容决定大小              | 父级需要 Flex 布局                     |
| `'fit-content(N)'`    | 同上，无内容时 fallback N   | 同上                                   |
| `'fill-container'`    | 填满父级剩余空间            | 父级需要 Flex 布局，且祖先链有固定宽度 |
| `'fill-container(N)'` | 同上，无 Flex 时 fallback N | —                                      |

`fill-container` 在 `layout: 'none'`（绝对定位）下无效。`fit-content` 仍可用于含文字节点（引擎通过 Yoga measureFunc 测量文字尺寸）。
