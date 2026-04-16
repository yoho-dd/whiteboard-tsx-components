# AGENTS.md

## 项目概述

**whiteboard-tsx-components** — 飞书画板的 TSX 组件库。

AI 用 TypeScript 函数调用组装图表 → 输出 JSON DSL → 交给 `@larksuite/whiteboard-cli` 渲染成 PNG。解决的核心问题：AI 每次从零手写 JSON DSL 效率低、配色间距不一致、无法复用常见 UI 模式（卡片、分区、图标卡片等）。

## 上下游关系

```
本项目（组件库）           @larksuite/whiteboard-cli（渲染引擎）
  ↓ 输出 JSON DSL              ↓ 接收 JSON
  Whiteboard() → {version:2}   validate → layout → routing → compile → PNG
```

- **依赖** DSL 类型定义（`WBNode`、`WBDocument`、`WBTextRun` 等），当前从本仓库的 `src/auto-layout-dsl/` 引用（从上游项目拷贝而来，见下方说明）
- **不依赖** whiteboard-cli 的运行时代码——组件库是纯函数，输出 JSON 对象
- whiteboard-cli 来自飞书画板团队的 monorepo `whiteboard-docx-block`（`/Users/david/work/whiteboard-docx-block/`），本项目从该仓库的 `packages/whiteboard-cli/src/components/` 抽离而来

## 上游拷贝目录（只读）

`src/auto-layout-dsl/` 来自另一个项目的拷贝，用于在本仓库内提供 DSL schema / types / measure 等基础能力，避免 IDE/TS 无法解析 `@larksuite/whiteboard-cli/auto-layout-dsl/*` 的子路径。

- **只读**：该目录视为 vendor 代码，暂时不要在本仓库内直接修改（需要改动请回到上游项目修改后再同步拷贝）。
- **引用方式**：本项目内部通过 `./auto-layout-dsl/types.js` 等相对路径引用该目录导出的类型。

## 架构

### 组件分层

```
Vendor DSL (src/auto-layout-dsl/) — 从上游拷贝的 schema/types/layout/text measure（只读）
  ↕
Design Tokens (theme.ts)       — 5 套主题、色彩组、字号、间距、圆角、图标尺寸
  ↕
原语层 (primitives.tsx)       — 1:1 映射 DSL 节点类型 + 基础校验
  Whiteboard, Rect, Ellipse, Diamond, Triangle, Trapezoid, Cylinder,
  Frame, HStack, VStack, DagreGraph, Text, StickyNote, Connector,
  Svg, Image, Icon

复合层 (composites.tsx)       — 封装常见 UI 模式
  基础: Card, IconCard, Badge, Section, LabeledRow
  增强: DetailCard, Table, BulletList, Divider, Pipeline, Legend, Figure, Callout

模板层 (templates.tsx)        — 面向场景的骨架模板
  ArchitectureTemplate, OrganizationChartTemplate, SwimlaneTemplate,
  ComparisonTemplate, FlowchartTemplate
```

### 关键机制

1. **JSX Runtime** (`jsx-runtime.ts`)：自定义 `jsx()`/`jsxs()`/`Fragment`，不依赖 React。组件函数接收 props → 返回 JSON 对象。当前项目使用函数直接调用（非 JSX 语法），但 runtime 已就绪，支持未来用 `@jsxImportSource` 启用 JSX。
2. **Connector 自动提升**：DSL 要求 connector 在 `document.nodes` 顶层。`Whiteboard` 组件递归扫描子树，把所有 connector 提升到顶层，AI 不需要关心这个约束。
3. **Markdown 增强文本** (`markdown-text.ts`)：所有 `text`/`title`/`subtitle` 属性支持 `**bold**`、`*italic*`、`~~strikethrough~~`、`<color=#HEX>`、`<bg=#HEX>`、`<size=N>` 语法，内部转为 `WBTextRun[]`。
4. **colorGroup 继承**：`Section` 设置 colorGroup 后，内部的 `Card`/`IconCard`/`Badge` 自动继承配色，无需逐个指定。通过模块级变量 `currentColorGroup` 实现（非 React Context）。
5. **主题状态**：通过模块级变量 `currentTheme` 传递。**必须在构建组件树之前调用** **`setTheme()`**，因为函数调用是立即求值的（不像 React 有渲染阶段）。
6. **本地 DSL 类型引用**：组件库不再从 npm 包子路径导入 DSL 类型，而是统一引用本仓库的 `src/auto-layout-dsl/types.ts`，避免 IDE 无法解析 `@larksuite/whiteboard-cli/auto-layout-dsl/*`。
7. **布局约束前置校验**：`Whiteboard` / `DagreGraph` 在输出 DSL 前会拦截明显非法的布局组合，例如 `layout: "none"` 非固定尺寸、dagre 使用非 `fit-content` 宽高。
8. **shape 叶子化**：`Rect/Ellipse/Diamond/Triangle/Cylinder/Trapezoid` 只作为叶子节点使用，不再承载 `children`。需要嵌套内容时统一使用 `Frame` / `Card` / 其他复合组件。
9. **模板层 intrinsic-first**：模板节点默认倾向于自包裹尺寸（如 `fit-content(220)`），优先保证多层嵌套的稳定性，而不是默认横向拉伸。

### 文件职责

| 文件                 | 行数    | 职责                                                     |
| ------------------ | ----- | ------------------------------------------------------ |
| `theme.ts`         | \~170 | 5 套主题定义、typography/spacing/borders/iconSize 常量、运行时主题状态 |
| `jsx-runtime.ts`   | \~60  | `jsx()`/`jsxs()`/`Fragment`、children 归一化               |
| `markdown-text.ts` | \~140 | markdown 增强语法 → `WBTextRun[]` 解析器                      |
| `primitives.tsx`   | \~300 | 17 个原语组件（Whiteboard/shapes/layouts/connector/embeds）+ DSL 合法性校验 |
| `composites.tsx`   | \~1400 | 13 个复合组件（基础 5 + 增强 8）                                 |
| `templates.tsx`    | \~450 | 5 个模板层组件（架构图 / 组织图 / 泳道图 / 对比图 / 流程图）              |
| `types.ts`         | \~600 | 所有组件的 Props 接口 + 模板层类型                                 |
| `index.ts`         | \~120 | 公共 API 入口，统一 re-export                                 |
| `src/auto-layout-dsl/types.ts` | \~300 | DSL 核心类型定义（vendor，只读）                           |
| `src/auto-layout-dsl/schema.ts` | \~900 | DSL schema / 校验逻辑（vendor，只读）                     |
| `src/auto-layout-dsl/layout-yoga.ts` | \~400 | Yoga 布局相关实现（vendor，只读）                   |
| `src/auto-layout-dsl/textMeasure.ts` | \~150 | 文字测量逻辑（vendor，只读）                        |
| `skills/whiteboard-tsx/SKILL.md` | \~300 | 项目内 whiteboard-tsx skill 的主说明文档                   |

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
npm test            # vitest run（当前约 113 个测试，含 auto-layout-dsl 的 vendor 测试）
npm run test:watch  # vitest watch 模式
npm run example     # 运行 examples/architecture.ts 输出 JSON
npm run playbook    # 启动 playbook 开发环境
npm run playbook:build  # 构建 playbook
```

## 已知约束

1. **宽度链仍然重要，但已不是唯一心智模型**：根容器仍建议给固定宽度；但模板层节点已改为 intrinsic-first，不应再假设“所有中间层默认 fill-container”。
2. **setTheme 时机**：必须在组件树构建前调用，不能依赖 `Whiteboard({ theme })` 的内部设置（因为 children 先于 parent 求值）。
3. **vendor 目录只读**：`src/auto-layout-dsl/` 来自上游项目拷贝，本仓不要直接修改；需要改动时应先回上游修改，再同步过来。
4. **类型同步**：当前类型来源是本仓的 `src/auto-layout-dsl/`；但它仍与上游 whiteboard-cli schema 强相关，上游 DSL 升级时要同步检查兼容性。
5. **Dagre 约束**：`DagreGraph` 只支持 `fit-content` 宽高；它应先成为自包裹的黑盒节点，再参与父层布局，不应当作 `fill-container` 容器使用。
6. **Absolute 布局约束**：`layout: "none"` 的 frame 必须使用固定数值宽高，且其子节点不能使用 `fill-container`。
7. **shape 不能再当容器**：shape 原语是叶子节点；若需要“图形壳 + 内嵌内容”，应改用 `Frame/Card` 组合表达。
8. **无 flex-wrap**：DSL 不支持换行，需要手动嵌套多行 HStack/VStack。
9. **SVG 限制**：`<text>`、`<image>`、`<foreignObject>`、外部 URL 均被 DSL 禁止。
10. **skill 真实目录已迁移**：当前真实 skill 目录是 `skills/`；`.claude/skills` 与 `.trae/skills` 只是软链接入口。

## AI Skill

`skills/whiteboard-tsx/SKILL.md` 是给 AI 的完整教学文档；`.claude/skills` 和 `.trae/skills` 通过软链接指向该目录。

文档包含：

- 组件选择决策表（图表类型 → 推荐组合）
- 全部组件 API 参考
- Design Token 参考表
- 2 个完整示例（分层架构图 + Dagre 流程图）
- 常见问题排查表
