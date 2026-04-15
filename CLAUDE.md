# CLAUDE.md

## 项目概述

**whiteboard-tsx-components** — 飞书画板的 TSX 组件库。

AI 用 TypeScript 函数调用组装图表 → 输出 JSON DSL → 交给 `@larksuite/whiteboard-cli` 渲染成 PNG。解决的核心问题：AI 每次从零手写 JSON DSL 效率低、配色间距不一致、无法复用常见 UI 模式（卡片、分区、图标卡片等）。

## 上下游关系

```
本项目（组件库）           @larksuite/whiteboard-cli（渲染引擎）
  ↓ 输出 JSON DSL              ↓ 接收 JSON
  Whiteboard() → {version:2}   validate → layout → routing → compile → PNG
```

- **依赖** `@larksuite/whiteboard-cli` 的类型定义（`WBNode`、`WBDocument`、`WBTextRun` 等），通过 `@larksuite/whiteboard-cli/auto-layout-dsl/types` 导入
- **不依赖** whiteboard-cli 的运行时代码——组件库是纯函数，输出 JSON 对象
- whiteboard-cli 来自飞书画板团队的 monorepo `whiteboard-docx-block`（`/Users/david/work/whiteboard-docx-block/`），本项目从该仓库的 `packages/whiteboard-cli/src/components/` 抽离而来

## 架构

### 组件分层

```
Design Tokens (theme.ts)    — 5 套主题、色彩组、字号、间距、圆角、图标尺寸
  ↕
原语层 (primitives.tsx)      — 1:1 映射 DSL 节点类型
  Whiteboard, Rect, Ellipse, Diamond, Triangle, Trapezoid, Cylinder,
  Frame, HStack, VStack, DagreGraph, Text, StickyNote, Connector,
  Svg, Image, Icon

复合层 (composites.tsx)      — 封装常见 UI 模式
  基础: Card, IconCard, Badge, Section, LabeledRow
  增强: DetailCard, Table, BulletList, Divider, Pipeline, Legend, Figure, Callout
```

### 关键机制

1. **JSX Runtime** (`jsx-runtime.ts`)：自定义 `jsx()`/`jsxs()`/`Fragment`，不依赖 React。组件函数接收 props → 返回 JSON 对象。当前项目使用函数直接调用（非 JSX 语法），但 runtime 已就绪，支持未来用 `@jsxImportSource` 启用 JSX。

2. **Connector 自动提升**：DSL 要求 connector 在 `document.nodes` 顶层。`Whiteboard` 组件递归扫描子树，把所有 connector 提升到顶层，AI 不需要关心这个约束。

3. **Markdown 增强文本** (`markdown-text.ts`)：所有 `text`/`title`/`subtitle` 属性支持 `**bold**`、`*italic*`、`~~strikethrough~~`、`<color=#HEX>`、`<bg=#HEX>`、`<size=N>` 语法，内部转为 `WBTextRun[]`。

4. **colorGroup 继承**：`Section` 设置 colorGroup 后，内部的 `Card`/`IconCard`/`Badge` 自动继承配色，无需逐个指定。通过模块级变量 `currentColorGroup` 实现（非 React Context）。

5. **主题状态**：通过模块级变量 `currentTheme` 传递。**必须在构建组件树之前调用 `setTheme()`**，因为函数调用是立即求值的（不像 React 有渲染阶段）。

### 文件职责

| 文件 | 行数 | 职责 |
|------|------|------|
| `theme.ts` | ~170 | 5 套主题定义、typography/spacing/borders/iconSize 常量、运行时主题状态 |
| `jsx-runtime.ts` | ~60 | `jsx()`/`jsxs()`/`Fragment`、children 归一化 |
| `markdown-text.ts` | ~140 | markdown 增强语法 → `WBTextRun[]` 解析器 |
| `primitives.tsx` | ~230 | 17 个原语组件（Whiteboard/shapes/layouts/connector/embeds） |
| `composites.tsx` | ~750 | 13 个复合组件（基础 5 + 增强 8） |
| `types.ts` | ~400 | 所有组件的 Props 接口 |
| `index.ts` | ~95 | 公共 API 入口，统一 re-export |

## 使用方式

```typescript
import { setTheme, spacing, typography } from './src/theme.js';
import { Whiteboard, VStack, HStack, Text, Connector } from './src/primitives.js';
import { Card, Section } from './src/composites.js';

setTheme('classic');

const doc = Whiteboard({
  theme: 'classic',
  children: [
    VStack({
      id: 'root',
      width: 1200,                    // 根容器必须固定宽度
      gap: spacing.lg,
      padding: spacing.xl,
      children: [
        Section({
          title: 'Service Layer',
          colorGroup: 'green',        // 子组件自动继承配色
          children: [
            HStack({
              alignItems: 'stretch',
              children: [
                Card({ id: 'svc-a', title: '**Service A**', subtitle: 'gRPC' }),
                Card({ id: 'svc-b', title: '**Service B**', subtitle: 'REST' }),
              ],
            }),
          ],
        }),
        Connector({ from: 'svc-a', to: 'svc-b', variant: 'main' }),
      ],
    }),
  ],
});

// 输出 JSON，管道给 whiteboard-cli 渲染
console.log(JSON.stringify(doc, null, 2));
```

```bash
npx tsx diagram.ts > diagram.json
whiteboard-cli -i diagram.json -o diagram.png
```

## 开发命令

```bash
npm test            # vitest run（52 个测试）
npm run test:watch  # vitest watch 模式
npm run example     # 运行 examples/architecture.ts 输出 JSON
```

## 已知约束

1. **宽度链不能断**：根 VStack 固定 width → Section fill-container → HStack fill-container（默认值）→ Card fill-container(200)。任一环节缺 width 会导致子节点宽度塌缩为 0，文字竖排。
2. **setTheme 时机**：必须在组件树构建前调用，不能依赖 `Whiteboard({ theme })` 的内部设置（因为 children 先于 parent 求值）。
3. **类型同步**：依赖 `@larksuite/whiteboard-cli` 的类型定义，CLI 升级 DSL schema 时需要检查兼容性。
4. **无 flex-wrap**：DSL 不支持换行，需要手动嵌套多行 HStack。
5. **SVG 限制**：`<text>`、`<image>`、`<foreignObject>`、外部 URL 均被 DSL 禁止。

## AI Skill

`.claude/skills/whiteboard-tsx/SKILL.md` 是给 AI 的完整教学文档，包含：
- 组件选择决策表（图表类型 → 推荐组合）
- 全部组件 API 参考
- Design Token 参考表
- 2 个完整示例（分层架构图 + Dagre 流程图）
- 常见问题排查表
