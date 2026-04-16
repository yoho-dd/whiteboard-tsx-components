---
name: whiteboard-tsx
description: >
  使用 TSX 组件库绘制飞书画板图表（架构图、流程图、组织架构等）。
  组件库提供 Card、Section、IconCard 等可复用组件和 Design Token 系统，
  比原始 JSON DSL 更高效、更一致。当用户要求画图时可选择此 skill。
compatibility: Requires Node.js 18+, npx tsx
---

# Whiteboard TSX 组件库

用 TypeScript 函数调用生成画板，替代手写 JSON DSL。组件自动处理配色、间距、连线提升等细节。

## Workflow

```
Step 1 → 分析需求，选择组件
Step 2 → 用组件函数组装图表（参考下方 API）
Step 3 → 渲染并交付
```

### Step 1: 分析需求

根据用户描述判断图表类型，选择组合方式：

| 图表类型 | 推荐组合 |
|---------|---------|
| 分层架构图 | `VStack` + 多个 `Section`(各层) + `Card`/`IconCard` |
| 流程图 | `DagreGraph` + `Rect`/`Diamond` + edges 定义拓扑 |
| 组织架构 | `VStack` + 嵌套 `HStack` + `Card` |
| 对比表格 | `HStack` + 多个 `VStack`(列) + `Card` |
| 仪表盘 | `VStack` + `HStack`(行) + `Card` + `Badge` |
| 泳道图 | `HStack` + 多个 `VStack`(泳道) + `Rect` |
| 论文配图 | `Figure` 包裹任意内容 + `Legend` + `Callout` 注释 |
| 数据流水线 | `Pipeline` + 步骤内嵌 `BulletList`/`Table` |
| API 文档 / UML | `DetailCard`(entries + children) + `Table` + `Badge` |
| 数据对比表 | `Table`(striped) + `Badge` 组件单元格 |
| 带注释的架构图 | `Section` + `Card` + `Callout` + `Legend` |
| 多步骤教程 | `Pipeline`(direction='vertical') + 步骤内嵌丰富内容 |

### Step 2: 生成代码

创建 `.ts` 文件，用组件函数组装图表。**不是 JSX 语法，是函数调用。**

```typescript
import { setTheme } from '../src/theme.js';
import { Whiteboard, VStack, HStack, Text, Connector } from '../src/primitives.js';
import { Card, IconCard, Section, Badge } from '../src/composites.js';
import { spacing, typography } from '../src/theme.js';

setTheme('classic');

const doc = Whiteboard({
  theme: 'classic',
  children: [
    // ... 组件调用
  ],
});

console.log(JSON.stringify(doc, null, 2));
```

### Step 3: 渲染

```bash
# 生成 JSON
npx tsx diagram.ts > diagram.json

# 渲染 PNG
whiteboard-cli -i diagram.json -o diagram.png
```

---

## 致命约束（违反必出 bug）

1. **必须先 `setTheme()` 再构建组件树。** 函数调用是立即求值的，`Whiteboard({ theme })` 内部的 `setTheme` 在子组件之后执行。
2. **宽度链必须完整。** 根容器必须有固定 `width`（如 1200），中间容器用 `fill-container`，否则子节点宽度为 0，文字变成竖排。
3. **Connector 的 from/to 必须是已存在的 id。** 每个需要被连线引用的节点必须设置 `id`。
4. **Connector 可以写在任意位置，会自动提升到顶层。** 不需要手动放到最外层。
5. **所有 text/title/subtitle 支持 markdown 增强语法。** `**粗体**`、`*斜体*`、`<color=#HEX>文字</color>`、`<size=N>文字</size>`。
6. **次要文本自动截断。** 为了防止长文本破坏布局，`subtitle` 和 `entries` 中的文本超过一定长度（60-80字）会自动截断并显示 `...`。
7. **约束优先。** 模板层节点默认使用 `fill-container`（受 `maxWidth` 限制）或 `fit-content` 以保证布局自动平衡，优先保证图表比例协调。

---

## 组件 API

### 根组件

#### `Whiteboard({ theme?, children })`
画板根节点。输出 `{ version: 2, nodes: [...] }`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| theme | `'classic'\|'business'\|'tech'\|'fresh'\|'minimalist'` | `'classic'` | 主题 |
| children | 组件数组 | — | 画板内容 |

---

### 布局容器

#### `VStack({ children, ... })` — 垂直排列
#### `HStack({ children, ... })` — 水平排列

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | string | — | 节点 ID |
| width | WBSizeValue | `'fill-container'` | 宽度 |
| height | WBSizeValue | `'fit-content'` | 高度 |
| flex | number | — | 弹性权重（如 1） |
| maxWidth | number \| string | — | 最大宽度 |
| minWidth | number \| string | — | 最小宽度 |
| gap | number | `16` (spacing.md) | 子元素间距 |
| padding | number \| [v,h] \| [t,r,b,l] | — | 内边距 |
| alignItems | `'start'\|'center'\|'end'\|'stretch'` | — | 交叉轴对齐 |
| justifyContent | `'start'\|'center'\|'end'\|'space-between'\|'space-around'` | — | 主轴对齐 |
| fillColor | string | — | 背景色 |
| borderColor | string | — | 边框色 |
| borderWidth | number | — | 边框宽度 |
| borderRadius | number | — | 圆角 |

#### `DagreGraph({ children, edges, ... })` — 有向图自动布局

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| edges | `[from, to][]` 或 `[from, to, label][]` | — | 拓扑边，自动生成连线 |
| rankdir | `'TB'\|'BT'\|'LR'\|'RL'` | `'TB'` | 方向 |
| nodesep | number | `60` | 节点间距 |
| ranksep | number | `100` | 层间距 |
| isCluster | boolean | — | 透明子图（子节点参与父级拓扑） |

#### `Frame({ layout, children, ... })` — 通用容器

`layout` 可选 `'horizontal'`、`'vertical'`、`'none'`、`'dagre'`。一般用 HStack/VStack/DagreGraph 代替。

---

### 形状

#### `Rect / Ellipse / Diamond / Cylinder / Triangle / Trapezoid`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | string | — | 节点 ID |
| width | WBSizeValue | — | 宽度 |
| height | WBSizeValue | — | 高度 |
| text | string | — | 文本（支持 markdown 增强） |
| fontSize | number | — | 字号 |
| textColor | string | — | 文字颜色 |
| fillColor | string | — | 填充色 |
| borderColor | string | — | 边框色 |
| borderWidth | number | — | 边框宽度 |
| borderRadius | number | — | 圆角（仅 Rect） |
| opacity | number (0-1) | — | 透明度 |

Triangle 和 Trapezoid 额外支持 `topWidth` 属性。

---

### 文本

#### `Text({ text?, children?, ... })`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | string | — | 文本内容（支持 markdown） |
| children | string | — | 也可以传字符串作 children |
| fontSize | number | — | 字号 |
| textColor | string | — | 文字颜色 |
| width | WBSizeValue | — | 宽度 |
| height | WBSizeValue | — | 高度 |

---

### 连线

#### `Connector({ from, to, ... })`

写在组件树任意位置，`Whiteboard` 自动提升到顶层。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| from | string \| {x,y} | — | 起点节点 ID 或坐标 |
| to | string \| {x,y} | — | 终点节点 ID 或坐标 |
| variant | `'main'\|'secondary'\|'async'\|'weak'` | `'secondary'` | 语义类型 |
| label | string | — | 连线文字标签 |
| lineShape | `'straight'\|'curve'\|'rightAngle'\|'polyline'` | — | 线条形状 |
| lineColor | string | 主题 connector 色 | 线色 |
| lineWidth | number | variant 决定 | 线宽 |
| lineStyle | `'solid'\|'dashed'\|'dotted'` | variant 决定 | 线型 |
| fromAnchor | `'top'\|'right'\|'bottom'\|'left'` | — | 起点锚点 |
| toAnchor | `'top'\|'right'\|'bottom'\|'left'` | — | 终点锚点 |
| startArrow | `'none'\|'arrow'\|'triangle'\|'circle'\|'diamond'` | — | 起点箭头 |
| endArrow | `'none'\|'arrow'\|'triangle'\|'circle'\|'diamond'` | — | 终点箭头 |

**variant 语义：**
- `main` → 粗实线（lineWidth: 2, solid），核心数据流
- `secondary` → 细实线（lineWidth: 1, solid），普通连接
- `async` → 细虚线（lineWidth: 1, dashed），异步/事件
- `weak` → 细点线（lineWidth: 1, dotted），弱关联

---

### 嵌入内容

#### `Icon({ name, color?, ... })`
内置图标。运行 `whiteboard-cli --icons` 查看全部可用图标名。

#### `Svg({ code, ... })` / `Image({ src, ... })`
SVG 代码（禁止 `<text>`/`<image>` 标签）或图片 URL。

---

### 复合组件

#### `Card({ id, title, subtitle?, colorGroup?, ... })`

标准卡片：标题 + 可选副标题。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | string | — | **必填** |
| title | string | — | **必填**，支持 markdown |
| subtitle | string | — | 副标题，支持 markdown |
| colorGroup | `'blue'\|'purple'\|'green'\|'yellow'\|'red'` | 继承自 Section | 配色组 |
| width | WBSizeValue | `'fill-container'` | 宽度 (默认 maxWidth: 360) |
| children | 组件 | — | 附加内容（如 Badge） |
| fillColor / borderColor | string | colorGroup 决定 | 可覆盖 |

生成结构：`frame(vertical)` → title(text, h3) + subtitle(text, sub)

默认样式：白底 + 柔和边框 + 圆角 8 + 内边距 [10, 16]

#### `IconCard({ id, icon, title, subtitle?, direction?, colorGroup?, ... })`

图标卡片，两种布局模式。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | string | — | **必填** |
| icon | string | — | **必填**，图标名 |
| title | string | — | **必填** |
| subtitle | string | — | 副标题 |
| direction | `'horizontal'\|'vertical'` | `'horizontal'` | 布局方向 |
| colorGroup | ColorGroupName | — | 配色组 |

- `horizontal`（Model A）：图标左 + 文字右，适合列表式排列
- `vertical`（Model B）：图标上 + 文字下，适合网格式排列

图标尺寸固定 28×28，颜色跟随 colorGroup 的 border 色。

#### `Badge({ text, colorGroup?, ... })`

药丸标签，常放在 Card 的 children 里。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | string | — | **必填** |
| colorGroup | ColorGroupName | — | 配色组 |
| fillColor | string | colorGroup.badgeBg | 背景色 |
| textColor | string | colorGroup.border | 文字色 |

默认：fontSize 10, 圆角 4, 内边距 [2, 8]

#### `Section({ title, colorGroup?, children, ... })`

带标题的分区容器，自动为子组件设置 colorGroup。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | — | **必填**，分区标题 |
| colorGroup | ColorGroupName | — | 配色组（子组件继承） |
| gap | number | `16` | 子元素间距 |
| padding | padding | `[24, 24]` | 内边距 |
| width | WBSizeValue | `'fill-container'` | 宽度 |

默认样式：浅色背景 + 深色边框 + 边框宽度 2 + 圆角 12

**colorGroup 继承**：Section 内的 Card/IconCard/Badge 如果不指定 colorGroup，自动继承 Section 的。

#### `LabeledRow({ label, children, labelWidth?, colorGroup? })`

Label-Outside 模式，左侧固定宽度标签 + 右侧填满内容。架构图分层常用。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string | — | **必填** |
| labelWidth | number | `80` | 标签列宽 |
| colorGroup | ColorGroupName | — | 标签颜色 |

---

### 新增复合组件

以下 8 个组件可深度嵌套，每个都是容器，内部可放文本、组件、组合组件甚至子图。

#### `DetailCard({ id, title, icon?, subtitle?, entries?, children?, footer?, colorGroup? })`

多段式富卡片，类似 UML 类图节点：头部（图标+标题）→ 分割线 → 主体（键值对+任意子组件）→ 尾部。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | string | — | **必填** |
| title | string | — | **必填**，支持 markdown |
| icon | string | — | 头部图标名 |
| subtitle | string | — | 副标题 |
| entries | `{ key: string, value: string }[]` | — | 键值对条目 |
| children | 组件 | — | 主体区域的任意子组件 |
| footer | 组件 | — | 尾部内容（如 Badge） |
| colorGroup | ColorGroupName | — | 配色组 |
| width | WBSizeValue | `'fill-container'` | 宽度 (默认 maxWidth: 360) |

生成结构：`frame(vertical)` → header(icon+title) + divider(rect h=1) + entries(key-value rows) + children + footer

```typescript
DetailCard({
  id: 'api-spec',
  icon: 'api',
  title: '**GET /users**',
  subtitle: '获取用户列表',
  entries: [
    { key: '认证', value: 'Bearer Token' },
    { key: '限流', value: '100 次/分钟' },
  ],
  children: [
    BulletList({ items: ['支持分页', '可过滤', '可排序'] }),
  ],
  footer: [Badge({ text: 'v2.0' }), Badge({ text: '稳定', colorGroup: 'green' })],
  colorGroup: 'blue',
})
```

#### `Table({ headers?, rows, columnWidths?, columnAligns?, striped?, colorGroup? })`

表格网格，单元格支持文本或任意组件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| headers | `string[]` | — | 列头（支持 markdown） |
| rows | `(string \| ComponentChildren)[][]` | — | **必填**，二维单元格数组 |
| columnWidths | `(number \| 'fill')[]` | 全部 `fill` | 列宽 |
| columnAligns | `('left'\|'center'\|'right')[]` | `'left'` | 列对齐 |
| striped | boolean | `true` | 隔行变色 |
| colorGroup | ColorGroupName | — | 配色组 |
| width | WBSizeValue | `'fill-container'` | 宽度 |

```typescript
Table({
  headers: ['参数', '类型', '必填'],
  rows: [
    ['page', 'integer', Badge({ text: '否', colorGroup: 'green' })],
    ['limit', 'integer', Badge({ text: '否', colorGroup: 'green' })],
    ['role', 'string', Badge({ text: '是', colorGroup: 'red' })],
  ],
  striped: true,
  colorGroup: 'blue',
})
```

#### `BulletList({ items, ordered?, bullet?, startNumber?, colorGroup?, gap?, fontSize? })`

内嵌列表，可放入任何容器。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | `(string \| { text: string, icon?: string })[]` | — | **必填** |
| ordered | boolean | `false` | 有序列表 |
| bullet | string | `"•"` | 无序列表符号 |
| startNumber | number | `1` | 有序列表起始编号 |
| gap | number | `4` | 行间距 |
| fontSize | number | `14` | 字号 |
| colorGroup | ColorGroupName | — | 配色组 |

```typescript
BulletList({
  items: [
    '支持分页查询',
    { text: '已通过安全审计', icon: 'check-circle' },
    '**新增** 批量操作接口',
  ],
  ordered: false,
})
```

#### `Divider({ direction?, color?, thickness?, label?, colorGroup? })`

分割线，可带居中标签。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| direction | `'horizontal'\|'vertical'` | `'horizontal'` | 方向 |
| color | string | colorGroup.softBorder | 线色 |
| thickness | number | `1` | 线粗 |
| label | string | — | 居中标签文字 |
| colorGroup | ColorGroupName | — | 配色组 |

```typescript
Divider({})                                // 简单横线
Divider({ label: 'OR' })                  // ── OR ──
Divider({ direction: 'vertical' })        // 竖线
```

#### `Pipeline({ steps, direction?, connectorVariant?, gap?, colorGroup? })`

流水线：步骤序列 + 自动生成相邻步骤间的 Connector。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| steps | `PipelineStep[]` | — | **必填**，步骤数组 |
| direction | `'horizontal'\|'vertical'` | `'horizontal'` | 方向 |
| connectorVariant | ConnectorVariant | `'main'` | 连线变体 |
| gap | number | `32` | 步骤间距 |
| colorGroup | ColorGroupName | — | 配色组 |

`PipelineStep`: `{ id: string, title: string, subtitle?: string, icon?: string, children?: ComponentChildren }`

```typescript
Pipeline({
  steps: [
    { id: 'parse', title: '解析', icon: 'code', subtitle: 'AST 生成' },
    { id: 'validate', title: '校验', icon: 'check-circle' },
    { id: 'deploy', title: '部署', icon: 'rocket', children: [
      BulletList({ items: ['灰度发布', '全量上线'] }),
    ]},
  ],
  colorGroup: 'green',
})
```

#### `Legend({ items, title?, direction?, colorGroup? })`

图例框：色块 + 标签。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | `{ color: string, label: string }[]` | — | **必填** |
| title | string | — | 图例标题 |
| direction | `'horizontal'\|'vertical'` | `'horizontal'` | 排列方向 |
| colorGroup | ColorGroupName | — | 配色组 |

```typescript
Legend({
  title: '图例',
  items: [
    { color: '#5178C6', label: '主数据流' },
    { color: '#509863', label: '异步消息' },
    { color: '#D25D5A', label: '错误路径' },
  ],
})
```

#### `Figure({ label?, title?, children, caption?, colorGroup? })`

学术图表包装器：编号 + 标题 + 内容 + 底部说明文字。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string | — | 编号（如 "Figure 1"） |
| title | string | — | 标题（支持 markdown） |
| children | 组件 | — | **必填**，图表内容 |
| caption | string | — | 底部说明文字 |
| colorGroup | ColorGroupName | — | 配色组 |
| width | WBSizeValue | `'fill-container'` | 宽度 |
| padding | padding | `[24, 24]` | 内边距 |

```typescript
Figure({
  label: 'Figure 3',
  title: '系统架构总览',
  caption: '展示三层架构设计及数据流向。',
  children: [
    // 这里可以放 Section、Pipeline、Table 等任意组件组合
    VStack({
      gap: spacing.md,
      children: [
        Section({ title: '服务层', colorGroup: 'green', children: [...] }),
        Section({ title: '数据层', colorGroup: 'purple', children: [...] }),
      ],
    }),
  ],
})
```

#### `Callout({ variant?, title?, body?, icon?, children?, colorGroup? })`

标注框，4 种语义变体。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'info'\|'warning'\|'success'\|'note'` | `'info'` | 语义变体 |
| title | string | — | 标题（支持 markdown） |
| body | string | — | 正文（支持 markdown） |
| icon | string | — | 图标覆盖（默认由 variant 决定） |
| children | 组件 | — | 正文下方的任意子组件 |
| colorGroup | ColorGroupName | — | 覆盖 variant 默认配色 |

**variant 映射：**
- `info` → 蓝色 + `info-circle` 图标
- `warning` → 黄色 + `warning-triangle` 图标
- `success` → 绿色 + `check-circle` 图标
- `note` → 紫色 + `edit` 图标

```typescript
Callout({
  variant: 'warning',
  title: '注意',
  body: '此接口将在 v3.0 废弃，请迁移到新版本。',
  children: [
    BulletList({ items: ['检查权限配置', '更新客户端 SDK'] }),
  ],
})
```

---

### 组合嵌套示例

所有新组件可深度嵌套，实现论文配图级别的丰富度：

```typescript
Figure({
  label: 'Figure 3',
  title: 'API 端点规格',
  caption: '用户服务完整的 REST API 规格说明。',
  children: [
    DetailCard({
      id: 'user-api',
      icon: 'api',
      title: '**GET /api/users**',
      subtitle: '获取用户列表',
      entries: [
        { key: '认证', value: 'Bearer Token' },
        { key: '限流', value: '100 次/分钟' },
      ],
      children: [
        BulletList({ items: ['支持分页', '可按角色过滤'] }),
        Table({
          headers: ['参数', '类型', '必填'],
          rows: [
            ['page', 'integer', Badge({ text: '否', colorGroup: 'green' })],
            ['role', 'string', Badge({ text: '是', colorGroup: 'red' })],
          ],
          striped: true,
        }),
      ],
      footer: [
        Badge({ text: 'v2.0', colorGroup: 'blue' }),
        Badge({ text: '稳定', colorGroup: 'green' }),
      ],
    }),
  ],
})
```

---

## Design Tokens

### 主题 (5 套)

| 名称 | 风格 | 适用场景 |
|------|------|---------|
| `classic` | 多彩清新（蓝紫绿黄红） | 默认，适合大多数图表 |
| `business` | 商务沉稳（蓝灰色系） | 正式商务报告 |
| `tech` | 暗色科技（深蓝底+亮色边框） | 技术架构展示 |
| `fresh` | 清新绿色 | 环保、健康相关 |
| `minimalist` | 极简黑白（灰色系） | 简洁文档 |

每个主题有 5 个颜色组（blue/purple/green/yellow/red），每组包含：
- `bg`：分区浅色背景
- `fill`：节点填充（通常白色）
- `border`：深色边框
- `softBorder`：柔和边框（卡片用）
- `text`：标题文字色
- `badgeBg`：Badge 背景色

### 字号 `typography`

| Token | fontSize | bold | 用途 |
|-------|----------|------|------|
| `h1` | 28 | ✓ | 画板大标题 |
| `h2` | 18 | ✓ | 分区标题 |
| `h3` | 14 | ✓ | 卡片标题 |
| `body` | 14 | ✗ | 正文 |
| `sub` | 11 | ✗ | 副标题 |
| `meta` | 10 | ✗ | Badge/元数据 |

### 间距 `spacing`

| Token | px | 常见用途 |
|-------|-----|---------|
| `xs` | 4 | Card 内 title-subtitle 间距 |
| `sm` | 8 | 紧凑元素间距 |
| `md` | 16 | 默认 gap |
| `lg` | 24 | Section 内部 padding、大间距 |
| `xl` | 32 | 根容器 padding |
| `xxl` | 48 | 超大间距 |

### 边框 `borders`

| Token | width | radius | 用途 |
|-------|-------|--------|------|
| `partition` | 2 | 12 | Section 外框 |
| `card` | 1 | 8 | Card / DetailCard 边框 |
| `badge` | 1 | 4 | Badge 圆角 |
| `divider` | 1 | — | Divider 线粗 |
| `table` | 1 | 6 | Table 边框 |

### 图标尺寸 `iconSize`

`sm: 16`, `md: 24`, `lg: 28`（卡片默认）, `xl: 32`

---

## 尺寸值 (WBSizeValue)

| 值 | 含义 |
|----|------|
| `number` (如 1200) | 固定像素 |
| `'fit-content'` | 根据内容自动计算 |
| `'fill-container'` | 填满父容器剩余空间 |
| `'fill-container'` | 填满父容器剩余空间（Card/DetailCard 默认带 maxWidth 约束） |

**宽度链规则：** 根 VStack 设固定 width → 子 Section 用 fill-container → 子 HStack 用 fill-container（默认值）→ Card 用 fill-container。内层组件宽度不再依赖 legacy 的 fallback 语法。

---

## 完整示例：分层架构图

```typescript
import { setTheme } from '../src/theme.js';
import { Whiteboard, VStack, HStack, Text, Connector } from '../src/primitives.js';
import { Card, IconCard, Section, Badge } from '../src/composites.js';
import { spacing, typography } from '../src/theme.js';

// ❶ 先设主题
setTheme('classic');

const doc = Whiteboard({
  theme: 'classic',
  children: [
    VStack({
      id: 'root',
      width: 1200,           // ← 根容器必须固定宽度
      gap: spacing.lg,       // 24
      padding: spacing.xl,   // 32
      fillColor: '#F8FAFC',
      children: [
        // 标题
        Text({
          id: 'title',
          text: 'System Architecture',
          fontSize: typography.h1.fontSize,
          textColor: '#1F2329',
          width: 'fit-content',
          height: 'fit-content',
        }),

        // 接入层（蓝色）
        Section({
          id: 'access',
          title: 'Access Layer',
          colorGroup: 'blue',
          children: [
            HStack({
              gap: spacing.md,
              alignItems: 'stretch',
              children: [
                IconCard({ id: 'nginx', icon: 'cloud-server', title: '**Nginx**', subtitle: 'Load Balancer' }),
                IconCard({ id: 'api', icon: 'api', title: '**API Gateway**', subtitle: 'REST + GraphQL' }),
              ],
            }),
          ],
        }),

        // 服务层（绿色）
        Section({
          id: 'services',
          title: 'Service Layer',
          colorGroup: 'green',
          children: [
            HStack({
              gap: spacing.md,
              alignItems: 'stretch',
              children: [
                Card({ id: 'user-svc', title: 'User Service', subtitle: 'Authentication' }),
                Card({ id: 'order-svc', title: 'Order Service', subtitle: 'CQRS Pattern' }),
                Card({ id: 'pay-svc', title: 'Payment', subtitle: 'Stripe Integration' }),
              ],
            }),
          ],
        }),

        // 数据层（紫色）
        Section({
          id: 'data',
          title: 'Data Layer',
          colorGroup: 'purple',
          children: [
            HStack({
              gap: spacing.md,
              children: [
                Card({ id: 'pg', title: 'PostgreSQL', subtitle: 'Primary DB' }),
                Card({ id: 'redis', title: 'Redis', subtitle: 'Cache Layer' }),
              ],
            }),
          ],
        }),
      ],
    }),

    // 连线
    Connector({ id: 'c1', from: 'nginx', to: 'api', variant: 'main' }),
    Connector({ id: 'c2', from: 'api', to: 'user-svc' }),
    Connector({ id: 'c3', from: 'api', to: 'order-svc' }),
    Connector({ id: 'c4', from: 'api', to: 'pay-svc' }),
    Connector({ id: 'c5', from: 'user-svc', to: 'pg', variant: 'main' }),
    Connector({ id: 'c6', from: 'order-svc', to: 'redis', variant: 'async', label: 'cache' }),
  ],
});

console.log(JSON.stringify(doc, null, 2));
```

## 完整示例：Dagre 流程图

```typescript
setTheme('classic');

const doc = Whiteboard({
  theme: 'classic',
  children: [
    DagreGraph({
      id: 'flow',
      width: 1000,
      height: 'fit-content',
      rankdir: 'LR',
      nodesep: 60,
      ranksep: 120,
      edges: [
        ['start', 'validate', '提交'],
        ['validate', 'approved', '通过'],
        ['validate', 'rejected', '驳回'],
        ['approved', 'end', '完成'],
        ['rejected', 'start', '重新提交'],
      ],
      children: [
        Ellipse({ id: 'start', width: 100, height: 60, text: '开始', fillColor: '#DFF5E5', borderColor: '#509863' }),
        Diamond({ id: 'validate', width: 120, height: 80, text: '审批', fillColor: '#FEF1CE', borderColor: '#D4B45B' }),
        Rect({ id: 'approved', width: 120, height: 60, text: '已通过', fillColor: '#DFF5E5', borderColor: '#509863', borderRadius: 8 }),
        Rect({ id: 'rejected', width: 120, height: 60, text: '已驳回', fillColor: '#FEE3E2', borderColor: '#D25D5A', borderRadius: 8 }),
        Ellipse({ id: 'end', width: 100, height: 60, text: '结束', fillColor: '#F0F4FC', borderColor: '#5178C6' }),
      ],
    }),
  ],
});

console.log(JSON.stringify(doc, null, 2));
```

---

## 常见问题排查

| 现象 | 原因 | 修复 |
|------|------|------|
| 文字竖排（每行一个字） | 宽度链断裂，某个容器没有 width | 确保每层容器都有 width（固定值或 fill-container） |
| 子组件没有继承颜色 | 没用 Section 包裹，或手动调用时没传 colorGroup | 用 Section 包裹，或显式传 colorGroup |
| Connector 报找不到节点 | from/to 引用的 id 不存在 | 检查节点是否设置了对应 id |
| 主题颜色没生效 | `setTheme()` 调用在组件构建之后 | 在文件最上方调用 `setTheme()` |
| Badge 不在卡片里 | Badge 放在 Card 的 children 里 | `Card({ ..., children: [Badge({ text: 'v1' })] })` |
