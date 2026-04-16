---
name: lark-whiteboard-cli
description: >
  当用户要求或使用飞书画板绘制架构图、流程图、思维导图、时序图或其他可视化图表时使用此 skill，作为使用 whiteboard-cli 设计图表布局的指南
compatibility: Requires Node.js 18+
metadata:
  requires:
    bins: ["lark-cli"]
---
## Skill 协作全景

画板体系由三个 skill 协作完成，各司其职：

```
lark-doc（文档入口）
  ├─ 写文档正文 + 创建空白画板 → 获取 board_token
  ├─ 多画板时：规划画板规格 → 并发 subagent 调度
  └─ 每个画板的实际绘制 → 委托给 lark-whiteboard-cli

lark-whiteboard-cli（DSL 引擎 ← 你在这里）
  ├─ DSL 路径：分析 → 内容规划 → 生成 DSL → 渲染 → 交付
  └─ Mermaid 路径：编写 .mmd → 渲染 → 交付

lark-whiteboard（API 层）
  ├─ +query: 导出已有画板（图片/代码/原始结构）
  └─ +update: 上传画板内容到飞书
```

**你什么时候会被调用**：
- 从 lark-doc 的并发 subagent 流程中，作为独立 agent 负责单个画板
- 从 lark-whiteboard 的「场景 1/2」流程中，作为 DSL 生成引擎
- 用户直接要求绘制图表时

---

## Workflow

> **这是画板，不是网页。** 画板是无限画布上自由放置元素，flex 布局是可选增强。

```
Step 1: 分析信息结构 & 选择图表类型
  用户通常不会说"画一个架构图"，而是说"梳理一下系统"、"分析原因"、"总结规划"。
  AI 需要主动分析信息的结构特征，选择最佳的可视化方式（见下方「信息结构 → 图表选型」）。

  然后：
  - 判断渲染路径（见路由表）：Mermaid 还是 DSL？
  - 读对应 scene 指南 — 了解结构特征和布局策略
  - 确定布局策略（见下方快速判断）和构建方式
  - 按需读 references/ 模块（详见下方「模块索引」）

Step 2: 内容规划（先想清楚画什么，再动手写 DSL）
  ① 信息分组：这张图有几个大分组/层级？每组包含哪些节点？
  ② 每个节点的内容：标题是什么？副标题/技术栈/描述写什么？用什么图标？
  ③ 连线规划：哪些节点之间有关系？几条连线？是否有主次之分？
  ④ 信息量检查：参考 content.md 的参考表，不要过度展开也不要过于简略

  > 这一步的产出是一份**脑中的内容清单**，不是 JSON。想清楚了再进入 Step 3。

Step 3: 生成完整 DSL
  按以下顺序构建，每个环节的关键规则已内联在下方，不必每次读全部 references 文件：

  3a. 骨架搭建（布局结构）
    - 选主布局：分层/分区 → Flex，关系链路 → Dagre，空间语义 → 绝对定位
    - 搭出 frame 嵌套结构，确定 gap / padding / width
    - 详细规则见 references/layout.md

  3b. 填充节点（复合卡片）
    - **代表具体事物的内容节点**（服务、模块、数据库、角色等）应使用 frame 复合卡片，而非纯文本 rect。scene 骨架中的 `{ "type": "rect", "text": "..." }` 是结构占位符，生成实际 DSL 时替换为复合卡片
    - **卡片内部结构自由组合**，不限于固定模板。根据节点承载的信息量决定复杂度：
      - 信息简单 → icon + 标题 + 副标题
      - 信息丰富 → 有色头部、标签行、属性列表、子项嵌套等自由组合
      - 关键数据 → 大号数字 + 趋势标签
    - 遵循设计原则：层次对比（≥ 2 层视觉重量差异）、信息密度匹配、内部留白、外轮廓统一
    - **聚合检查**：同一层级 5+ 个同类节点时，应通过分组容器或聚合卡收纳，减少视觉噪音
    - 运行 `DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js --icons` 查看可用图标
    - 图标 name 必须从 `--icons` 列表中精确选取（不可自造名称），选取时按语义相似度匹配：优先完整匹配，其次包含关键词的复合名（如需"存储"相关图标，优先 `cloud-storage` / `storage-device`）
    - 详细设计原则与示范见 references/schema.md「复合卡片」

  3c. 视觉层级（配色 + 排版 + 边框）
    - 配色：用户没指定时用经典色板，每个分组选一种主色（详见 references/style.md）
    - 边框层级：层容器 borderWidth=2 borderRadius=12 → 内容卡片 borderWidth=1 borderRadius=10 → Badge borderWidth=1 borderRadius=4
    - 卡片边框用分组色的柔和变体（如蓝组容器 #5178C6，卡片 #C2D3EE），不要内外都用主色
    - 文字层级：标题 bold #1F2329 → 副标题 normal #8F959E → 分区标签 bold 用分组主色
    - 连线：主路径 lineWidth=2 solid，次要 lineWidth=1，异步 dashed
    - 无障碍：浅色底上不用白字/浅灰字，红绿并存分组用形状/虚实辅助区分
    - 详细规则见 references/style.md、references/typography.md

  3d. 连线（仅需要时）
    - Dagre 的连线在 layoutOptions.edges 中声明，引擎自动生成
    - Flex 布局的连线用顶层 connector 节点
    - 详细规则见 references/connectors.md

  注意：部分图形（鱼骨/飞轮/柱状/折线等）要按 scene 指南的脚本模板写 .cjs 脚本生成 JSON：
    1. 创建产物目录 ./diagrams/YYYY-MM-DDTHHMMSS/
    2. 将脚本保存为 diagram.gen.cjs，执行 node diagram.gen.cjs 产出 diagram.json
    3. 用产出的 diagram.json 进入 Step 4

Step 4: 渲染 & 审查 → 交付（质量优先，不可跳过）
  - 渲染前自查（见下方检查清单）
  - 渲染 PNG，**必须审视渲染结果**（打开图片看，不要跳过）：
    · 逐项检查：对齐？截断？交叉？间距？图标？
    · 检查 CLI 返回的 quality 分数，对照下方质量门禁

  - quality 门禁（务实原则：**最多迭代 1 轮**，避免反复优化收益递减）：
    ┌─ 硬门禁（不达标修 1 轮，修不好直接交付当前最优版本）：
    │  · fontSizeCheck < 1.0 → 有字号过小的文字，fontSize >= 10
    │  · bounds < 1.0 → 节点超出画布，调整坐标或画布尺寸
    │  · contrast < 1.0 → 文字与背景对比度不足
    │
    └─ 软门禁（仅记录，不强制迭代）：
       · anchorDirection / connectorRefs / spacing / sizeConsistency
       · 如果渲染结果视觉上可接受，直接交付

  - 修改后输出为 _v{N+1}（见文件产物规范），不覆盖旧版本
  - 没问题 → 将最优版本复制为 diagram.json / diagram.png，交付：
    · 用户要求上传飞书 → 见下方”上传飞书画板”章节中的说明
    · 用户未指定 → 展示 PNG 图片给用户

  > **多画板场景**：如果你是被 subagent 调度来完成单个画板的，完成本画板的渲染和上传即可，无需关心其他画板。如果你需要自己处理多个画板，参见 [lark-doc 的并发执行流程](../lark-doc/SKILL.md) 了解如何并发调度。
```

**布局策略快速判断**（详见 `references/layout.md`）：

先定**主布局**，再定子布局：**结构化信息**优先用 Flex，**关系链路**优先用 Dagre，**灵活定位**用绝对布局。

涉及 Dagre / Flex 的具体边界、危险模式、混合布局原则，统一以 `references/layout.md` 为准；scene 文件只描述场景差异，不重复定义通用布局规则。

> **构建方式是强约束**：当 scene 指南要求"脚本生成"时，必须先写脚本（.cjs）并用 `node` 执行来产出 JSON 文件。绝对定位场景（鱼骨图、飞轮图、柱状图、折线图等）的坐标需要数学计算，直接手写 JSON 极易导致节点重叠或连线穿模。
---

## 信息结构 → 图表选型

> **一图胜千言。** 用户很少主动说"画个图"，但当信息具备以下结构特征时，应主动选择画板可视化，而非纯文字输出。

分析信息的**结构特征**，匹配最佳图表类型：

| 信息结构特征 | 最佳图表 | 用户可能怎么说 |
|-------------|---------|-------------|
| 技术原理、架构原理、系统设计方案、处理管道、算法机制 | 概念原理图 | "解释一下原理"、"画个架构"、"系统设计"、"Pipeline"、"论文配图" |
| 需要按层级枚举模块清单 | 分层线框图 | "列出每层有什么模块"、"分层架构总览" |
| 有先后顺序、条件判断、分支 | 流程图 | "理一下流程"、"审批怎么走的" |
| 多角色协作、跨系统交互 | 泳道图 | "整理一下从下单到收货"、"各方怎么配合的" |
| 多方案按多维度对比 | 对比图 | "对比一下 A 和 B"、"选哪个好"、"技术选型" |
| 问题 + 多类别原因分析 | 鱼骨图 | "分析原因"、"为什么出问题"、"复盘" |
| 时间轴 + 关键节点 | 里程碑 | "规划"、"路线图"、"迭代计划" |
| 闭环关系、正反馈循环 | 飞轮图 | "增长模型"、"闭环"、"飞轮" |
| 从属层级、上下级关系 | 组织架构图 | "组织架构"、"汇报关系"、"团队结构" |
| 逐级递减的转化 | 漏斗图 | "转化率"、"漏斗"、"各阶段流失" |
| 层级递进、底层到顶层 | 金字塔图 | "能力模型"、"需求层次"、"优先级" |
| 多类型数据聚合总览 | Dashboard | "日报"、"周报"、"数据看板"、"项目总览" |
| 服务调用、网状依赖 | Dagre 拓扑 | "调用关系"、"依赖"、"链路" |
| 分类层级 + 占比 | 树状图 | "分布"、"各部分占比"、"预算分配" |
| 发散/收敛的知识体系 | 思维导图 | "梳理知识点"、"头脑风暴"、"整理思路" |
| 数值趋势变化 | 折线图/柱状图 | "趋势"、"变化"、"对比数据" |

**选型原则**：
1. 看**信息结构**而非关键词——"总结系统设计"可能是概念原理图，也可能是 Dashboard，取决于内容是架构原理还是多维数据聚合。用户说"架构"不等于分层线框图
2. 用户没提"画图"不代表不需要图——只要信息具备上述结构特征，就应该主动用画板呈现
3. 同一需求可能适合多种图——优先选**信息结构匹配度最高**的那个，不确定时选最能突出核心关系的
4. 如果信息结构复杂到一张图放不下（如既有架构又有流程又有数据），考虑用 **Dashboard** 把多种子图聚合在一张看板里
5. **当信息不严格匹配任何模板类型时，选概念原理图**（`scenes/concept.md`）。概念原理图不是"兜底"——它提供了网格系统、中轴线对齐、图标卡片等通用方法论，适合任何需要自由表达的场景

---

## 渲染路径选择（DSL or Mermaid）

| 图表类型     | 路径        | 理由                |
| ------------ | ----------- | ------------------- |
| 思维导图     | **Mermaid** | 辐射结构自动布局    |
| 时序图       | **Mermaid** | 参与方+消息自动排列 |
| 类图         | **Mermaid** | 类关系自动布局      |
| 饼图         | **Mermaid** | Mermaid 原生支持    |
| 概念原理图  | **DSL**     | 自由构图，概念驱动  |
| 其他所有类型 | **DSL**     | 精确控制样式和布局  |

**路由规则**：
0. **概念原理图优先**：如果内容是解释原理/机制/架构思想，需要展示数据流/调用链路/处理管道（非判断分支型），或描述系统设计方案/架构原理，或用户要求"专业""论文风格""灵活布局" → 走概念原理图路径 (`scenes/concept.md`)。**注意**：用户说"架构"时，大多数情况是要解释架构原理而非枚举模块清单，应优先走概念原理图
1. **自动 Mermaid**：思维导图、时序图、类图、饼图 → 默认走 Mermaid
2. **显式 Mermaid**：用户输入包含 Mermaid 语法 → 走 Mermaid
3. **DSL 路径**：其他所有类型 → 先读核心模块，再读对应场景指南

**Mermaid 路径**：参考 `scenes/mermaid.md` 编写 `.mmd` 文件，跳过 DSL 模块。
**DSL 路径**：按 Workflow 4 步执行（Step 1→2→3→4）。

---

## 模块索引

### 核心参考（DSL 路径必读）

| 模块     | 文件                       | 说明                            |
| -------- | -------------------------- | ------------------------------- |
| DSL 语法 | `references/schema.md`     | 节点类型、属性、尺寸值          |
| 内容规划 | `references/content.md`    | 信息提取、密度决策、连线预判    |
| 布局系统 | `references/layout.md`     | 网格方法论、Flex 映射、间距规则 |
| 排版规则 | `references/typography.md` | 字号层级、对齐、行距            |
| 连线系统 | `references/connectors.md` | 拓扑规划、锚点选择              |
| 配色系统 | `references/style.md`      | 多色板、视觉层级                |


### 场景指南（按类型选读一个）

| 图表类型    | 文件                     | 适用场景                               |
| ----------- | ------------------------ | -------------------------------------- |
| 概念原理图  | `scenes/concept.md`      | 技术原理、架构原理、系统设计方案、处理管道、论文配图 |
| 分层线框图  | `scenes/architecture.md` | 按层级枚举模块清单、分层总览           |
| 组织架构图  | `scenes/organization.md` | 公司组织、树形层级                     |
| 泳道图      | `scenes/swimlane.md`     | 跨角色流程、跨系统交互流程、端到端链路 |
| 对比图      | `scenes/comparison.md`   | 方案对比、技术选型、功能矩阵           |
| 鱼骨图      | `scenes/fishbone.md`     | 因果分析、根因分析                     |
| 柱状图      | `scenes/bar-chart.md`    | 柱状图、条形图                         |
| 折线图      | `scenes/line-chart.md`   | 折线图、趋势图                         |
| 树状图      | `scenes/treemap.md`      | 矩形树图、层级占比                     |
| 漏斗图      | `scenes/funnel.md`       | 转化漏斗、销售漏斗                     |
| 金字塔图    | `scenes/pyramid.md`      | 层级结构、需求层次                     |
| 循环/飞轮图 | `scenes/flywheel.md`     | 增长飞轮、闭环链路                     |
| 里程碑      | `scenes/milestone.md`    | 时间线、版本演进                       |
| 流程图      | `scenes/flowchart.md`    | 业务流、状态机、带条件判断的链路       |
| Dashboard   | `scenes/dashboard.md`    | 数据看板、运营日报、系统监控、项目总览 |
| Mermaid     | `scenes/mermaid.md`      | 思维导图、时序图、类图、饼图           |

---

## 文件产物规范

每次绘图在 `./diagrams/` 下按当前时间创建子目录（格式 `YYYY-MM-DDTHHMMSS`）。**每次迭代生成新版本文件，不覆盖旧版本**，便于对比和回退。用户指定了保存路径时以用户为准。

```
./diagrams/
  2026-03-27T143000/      ← 自动按时间创建，无需起名
    diagram.gen.cjs       ← 坐标计算脚本（仅脚本构建方式）
    diagram_v1.json       ← 第 1 版 DSL
    diagram_v1.png        ← 第 1 版渲染
    diagram_v2.json       ← 第 2 版（修正后）
    diagram_v2.png        ← 第 2 版渲染
    diagram.json          ← 最终采用版本的副本（= 最优版本）
    diagram.png           ← 最终采用版本的副本
    diagram.mmd           ← Mermaid 源码（仅 Mermaid 路径）
```

**迭代规则**：
- 每次修改后输出为 `_v{N+1}`，不覆盖 `_v{N}`
- 审视时可对比多个版本的 PNG，选最优版本
- 确定最终版本后，复制为 `diagram.json` / `diagram.png` 用于交付
- 如果优化后反而变差，可以回退到前一版本

## CLI 命令

**查看可用图标**：
```bash
DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js --icons
```

**渲染**：
```bash
DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js -i ./diagrams/2026-03-27T143000/diagram.json -o ./diagrams/2026-03-27T143000/diagram.png    # DSL
DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js -i ./diagrams/2026-03-27T143000/diagram.mmd -o ./diagrams/2026-03-27T143000/diagram.png     # Mermaid
```

**上传飞书画板**：

> 上传需要飞书认证。遇到认证或权限错误时，阅读 [`../lark-shared/SKILL.md`](../lark-shared/SKILL.md) 了解登录和权限处理。

**第一步：获取画板 Token**

| 用户给了什么                       | 怎么获取 Token                                                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 画板 Token（`XXX`）                | 直接使用                                                                                                                                                       |
| 文档 URL 或 doc_id，文档中已有画板 | `lark-cli docs +fetch --doc <URL> --as user`，从返回的 `<whiteboard token=”XXX”/>` 中提取 token                                                                |
| 文档 URL 或 doc_id，需要新建画板   | `lark-cli docs +update --doc <doc_id> --mode append --markdown '<whiteboard type=”blank”></whiteboard>' --as user`，从响应的 `data.board_tokens[0]` 获取 token |

关于飞书文档的创建，读取等更多操作，请参考 lark-doc skill [`../lark-doc/SKILL.md`](../lark-doc/SKILL.md)。

**第二步：上传**

> [!CAUTION]
> **MANDATORY PRE-FLIGHT CHECK (上传前强制拦截检查)**
> 当你要向一个**已存在的画板 Token** 写入内容时，**绝对禁止**直接执行上传命令！你必须严格遵守以下两步：
> **强制执行 Dry Run（状态探测）**
> 必须先在命令中添加 `--overwrite --dry-run` 参数来探测画板当前状态。示例命令：
> ```bash
> DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js --to openapi -i <输入文件> --format json | lark-cli whiteboard +update --whiteboard-token <Token> --source - --overwrite --dry-run --as user
> ```
>
> **解析结果并拦截**
> - 仔细阅读 Dry Run 的输出日志。
> - **如果日志包含 `XX whiteboard nodes will be deleted`**：这说明画板**非空**，当前操作会覆盖并摧毁用户的原有图表！
> - **你必须立即停止操作**，并通过 `AskUserQuestion` 工具（或直接回复）向用户确认：”目标画板当前非空，继续更新将清空原有的 XX 个节点，是否确认覆盖？”
> - 只有在用户明确授权”同意覆盖”后，你才能移除 `--dry-run` 真正执行上传。
> - 用户可能会要求你不覆盖更新画板内容，在这种情况下，移除 `--overwrite` 和 `--dry-run` 参数再上传。

```bash
DEBUG=1 node ./packages/whiteboard-cli/bin/cli.js --to openapi -i <输入文件> --format json | lark-cli whiteboard +update --whiteboard-token <画板Token> --source - --yes --as user
```
> 画板一经上传不可修改。如需应用身份上传，将 `--as user` 替换为 `--as bot`。
> 如果画板非空，先加 `--overwrite --dry-run` 检查待删除节点数，向用户确认后去掉 `--dry-run` 执行。

你也可以将布局输出为原生 OpenAPI json 格式，再通过 lark-cli 导入飞书画板。关于 lark-cli 操作画板的更多方式，请参照 [../lark-whiteboard/SKILL.md](../lark-whiteboard/SKILL.md)

**症状→修复表**（视觉审查发现问题时参照）：

| 看到的问题         | 改什么                              |
| ------------------ | ----------------------------------- |
| 文字被截断         | height 改为 fit-content             |
| 文字溢出容器右侧   | 增大 width，或缩短文字              |
| 节点重叠粘连       | 增大 gap                            |
| 节点挤成一团       | 增大 padding 和 gap                 |
| 连线穿过节点       | 调整 fromAnchor/toAnchor 或增大间距 |
| 大面积空白         | 缩小外层 frame 宽度                 |
| 文字和背景色太接近 | 调整 fillColor 或 textColor         |
| 布局整体偏左/偏右  | 调整绝对定位的 x 坐标使内容居中     |

---

## 渲染前自查

生成 DSL 后、渲染前，快速检查（`▶` = 渲染后有自动门禁检测，`◉` = 需目视确认）：

- ◉ 不同分组用了不同颜色？同组节点样式完全一致？
- ◉ 外层浅色背景、内层白色/深色节点？（外重内轻）
- ◉ **内容节点使用了复合卡片**，而非纯文本 rect？卡片内部有 ≥ 2 层视觉层次？（规则详见 [schema.md 复合卡片](references/schema.md)）
- ◉ **卡片复杂度匹配信息量**？信息丰富的节点不只有标题？信息简单的节点没有过度包装？
- ◉ **同级节点数合理**？5+ 个同类节点已通过分组或聚合卡收纳？
- ◉ **边框粗细有层级**？容器 borderWidth=2，卡片 borderWidth=1，标签 borderWidth=1？
- ◉ **文字有至少 2 级层次**？标题 bold + 深色，副标题 normal + 弱化色？
- ◉ 连线用灰色（#BBBFC4），不用彩色？主次连线粗细有区分？
- ◉ **连线目标正确**？from/to 和 Dagre edges 引用复合卡片最外层 frame 的 id，卡片内部子元素不设 id？（规则详见 [connectors.md](references/connectors.md)）
- ▶ frame 都写了 layout 属性？gap 和 padding 都显式设置了？
- ▶ 含文字节点 height 用 fit-content？（**fontSizeCheck** 门禁，规则详见 [schema.md WBSizeValue](references/schema.md)）
- ▶ connector 在顶层 nodes 数组？（规则详见 [connectors.md](references/connectors.md)）
- ▶ 节点未超出画布？（**bounds** 门禁）
- ▶ 文字与背景对比度足够？（**contrast** 门禁）

---

## 关键约束速查

> 最高频出错的规则摘要。每条规则的完整定义和示例在对应的权威源文件中。

1. **含文字节点的 height 必须用 `'fit-content'`** — 写死数值会截断文字 → [schema.md WBSizeValue](references/schema.md)
2. **`fill-container` 仅在 flex 父容器中生效** — `layout: 'none'` 下宽度退化为 0 → [schema.md](references/schema.md)
3. **`layout: 'none'` 的容器必须有固定宽高** — 不要写成 `fit-content` → [layout.md](references/layout.md)
4. **connector 必须放在顶层 nodes 数组** — 不能嵌套在 frame children 里 → [connectors.md](references/connectors.md)
5. **图层顺序** — 数组顺序 = 绘制顺序。后定义的元素层级越高。重叠/浮层/标注元素务必放在数组末尾
6. **flex 容器内的 x/y 会被完全忽略** — 需要自由定位时用 `layout: 'none'` 或放在顶层 nodes → [layout.md](references/layout.md)
7. **Dagre 子容器默认为不透明节点** — 需穿透时声明 `layout: "dagre"` + `layoutOptions: { isCluster: true }` → [schema.md Dagre 嵌套](references/schema.md)
8. **连线目标必须是复合卡片的最外层 frame** — 内部子元素不设 id → [connectors.md 连线目标规则](references/connectors.md)
9. **内容节点使用复合卡片** — 代表具体事物的节点用 frame 复合卡片，内部结构自由组合，满足设计原则 → [schema.md 复合卡片](references/schema.md)

❌ 致命错误：flex 容器内设 x/y，坐标不生效，节点按顺序排列
```json
{ "type": "frame", "layout": "vertical", "children": [
  { "type": "rect", "x": 100, "y": 0, "text": "成都" },
  { "type": "rect", "x": 540, "y": 0, "text": "康定" }
]}
```
✅ 正确：用 `layout: "none"` 或放在顶层 nodes 用 x/y 定位。

❌ 致命错误：`layout: "none"` 容器本身写 `width: "fit-content", height: "fit-content"`，再在内部摆绝对坐标节点

✅ 正确：绝对定位容器先给固定宽高，再在内部用 x/y 放置子节点。
