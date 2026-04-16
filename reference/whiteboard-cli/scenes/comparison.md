# 对比图

适用于：方案对比、技术选型、产品比较等多选项按多维度比较的场景。

**画布对比图的价值在于视觉化**——如果每个格子只放纯文字，不如直接用表格。画布对比图应利用图示、指标条、评级标记等视觉手段，让对比结果**一眼可判断**。

## 模式选择

| 维度数量 | 模式 | 说明 |
|---------|------|------|
| **1-2 个维度** | 分栏卡片 | 每个对象一张独立卡片并排，卡片内自由组合 |
| **3+ 个维度** | 表格 + 丰富单元格 | 行列表格做对齐骨架，每个单元格内用子图表达 |

## Content 约束

- **合并相关维度**：不要罗列所有细分维度，把相关维度合并为一个综合区域（如"资源利用率 + 弹性扩缩 + 成本"合并为"资源效率"），控制行数在 3-6 行
- **每格有足够信息量**：合并维度后每格应有丰富内容可展示，而非一个词
- **每格选最佳表达**：根据信息特征为每个格子选择合适的区域类型（见下方），不要全用纯文字
- 列头用复合卡片（icon + 名称 + 一句话定位），不要纯文字 rect
- 对比对象建议 ≤ 5 列（含维度列），超过时合并或拆分

## 单元格区域类型

每个单元格是一个 frame，内部根据信息特征选择最合适的表达方式：

### 评级 Badge

适合：可打分的优劣判断（性能、成本、难度等）。

badge + 简短说明，颜色编码优劣：

```json
{
  "type": "frame", "layout": "vertical", "gap": 6, "padding": [10, 14],
  "width": "fill-container", "height": "fit-content",
  "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 8,
  "children": [
    { "type": "frame", "layout": "horizontal", "padding": [2, 8],
      "fillColor": "#DFF5E5", "borderColor": "#509863", "borderWidth": 1, "borderRadius": 4,
      "children": [
        { "type": "text", "text": "优", "fontSize": 10, "width": "fit-content", "height": "fit-content", "textColor": "#509863" }
      ]},
    { "type": "text", "width": "fill-container", "height": "fit-content",
      "text": "物理级隔离，安全性最高", "fontSize": 12, "textColor": "#1F2329" }
  ]
}
```

badge 配色：

| 评级 | fillColor | borderColor | textColor |
|------|-----------|-------------|-----------|
| 优 / ✓ | `#DFF5E5` | `#509863` | `#509863` |
| 良 | `#F0F4FC` | `#5178C6` | `#5178C6` |
| 中 / △ | `#FEF1CE` | `#D4B45B` | `#B8972E` |
| 差 / ✗ | `#FEE3E2` | `#D25D5A` | `#D25D5A` |

### 指标条（Metric Bar）

适合：可量化的性能指标，需要直观对比相对值。

用两段 rect 模拟进度条，有色段代表值，浅灰段代表剩余：

```json
{
  "type": "frame", "layout": "vertical", "gap": 6, "padding": [10, 14],
  "width": "fill-container", "height": "fit-content",
  "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 8,
  "children": [
    { "type": "frame", "layout": "horizontal", "gap": 4, "padding": 0, "alignItems": "center",
      "children": [
        { "type": "text", "width": 50, "height": "fit-content", "text": "读吞吐", "fontSize": 10, "textColor": "#646A73" },
        { "type": "rect", "width": 80, "height": 8, "fillColor": "#5178C6", "borderWidth": 0, "borderRadius": 4 },
        { "type": "rect", "width": 20, "height": 8, "fillColor": "#E8E9EB", "borderWidth": 0, "borderRadius": 4 }
      ]},
    { "type": "frame", "layout": "horizontal", "gap": 4, "padding": 0, "alignItems": "center",
      "children": [
        { "type": "text", "width": 50, "height": "fit-content", "text": "写吞吐", "fontSize": 10, "textColor": "#646A73" },
        { "type": "rect", "width": 40, "height": 8, "fillColor": "#5178C6", "borderWidth": 0, "borderRadius": 4 },
        { "type": "rect", "width": 60, "height": 8, "fillColor": "#E8E9EB", "borderWidth": 0, "borderRadius": 4 }
      ]}
  ]
}
```

有色段和灰段的宽度之和保持一致（如都为 100），按比例分配。

### 迷你图示（Mini Diagram）

适合：**架构模式、数据结构、拓扑差异等文字难以表达的概念**。这是画布对比图最有价值的区域类型。

用 frame 嵌套 rect/icon/text 搭出简化的结构示意，传达概念即可，不需要精确：

```json
{
  "type": "frame", "layout": "vertical", "gap": 6, "padding": [10, 14],
  "width": "fill-container", "height": "fit-content",
  "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 8,
  "children": [
    { "type": "text", "width": "fill-container", "height": "fit-content",
      "text": [{"content": "行式存储", "bold": true, "fontSize": 11}], "textColor": "#1F2329" },
    { "type": "frame", "layout": "vertical", "gap": 2, "padding": 6,
      "fillColor": "#F8F9FA", "borderRadius": 6,
      "children": [
        { "type": "frame", "layout": "horizontal", "gap": 2, "padding": 0, "children": [
          { "type": "rect", "width": 30, "height": "fit-content", "fillColor": "#5178C6", "borderWidth": 0, "borderRadius": 2, "text": "id", "fontSize": 10, "textColor": "#FFFFFF" },
          { "type": "rect", "width": 50, "height": "fit-content", "fillColor": "#C2D3EE", "borderWidth": 0, "borderRadius": 2, "text": "name", "fontSize": 10, "textColor": "#1F2329" },
          { "type": "rect", "width": 30, "height": "fit-content", "fillColor": "#C2D3EE", "borderWidth": 0, "borderRadius": 2, "text": "age", "fontSize": 10, "textColor": "#1F2329" }
        ]},
        { "type": "frame", "layout": "horizontal", "gap": 2, "padding": 0, "children": [
          { "type": "rect", "width": 30, "height": "fit-content", "fillColor": "#E8E9EB", "borderWidth": 0, "borderRadius": 2, "text": "1", "fontSize": 10, "textColor": "#646A73" },
          { "type": "rect", "width": 50, "height": "fit-content", "fillColor": "#E8E9EB", "borderWidth": 0, "borderRadius": 2, "text": "张三", "fontSize": 10, "textColor": "#646A73" },
          { "type": "rect", "width": 30, "height": "fit-content", "fillColor": "#E8E9EB", "borderWidth": 0, "borderRadius": 2, "text": "28", "fontSize": 10, "textColor": "#646A73" }
        ]}
      ]
    },
    { "type": "text", "width": "fill-container", "height": "fit-content",
      "text": "整行读写，适合事务操作", "fontSize": 10, "textColor": "#646A73" }
  ]
}
```

迷你图示的要点：
- 用 rect 色块 + 小字模拟数据结构、架构、拓扑等
- 保持简化（3-5 个元素），传达模式差异即可
- 底部加一句文字说明核心特征
- 用 `fillColor: "#F8F9FA"` 灰底区分图示区和文字区

### 特性清单（Feature Checklist）

适合：功能支持矩阵、能力列表。

每行 icon + text，icon 颜色表示支持程度：

```json
{
  "type": "frame", "layout": "vertical", "gap": 4, "padding": [10, 14],
  "width": "fill-container", "height": "fit-content",
  "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 8,
  "children": [
    { "type": "frame", "layout": "horizontal", "gap": 6, "padding": 0, "alignItems": "center",
      "children": [
        { "type": "icon", "name": "checkmark-circle", "width": 14, "height": 14, "color": "#509863" },
        { "type": "text", "width": "fit-content", "height": "fit-content", "text": "ACID 事务", "fontSize": 11, "textColor": "#1F2329" }
      ]},
    { "type": "frame", "layout": "horizontal", "gap": 6, "padding": 0, "alignItems": "center",
      "children": [
        { "type": "icon", "name": "warning", "width": 14, "height": 14, "color": "#D4B45B" },
        { "type": "text", "width": "fit-content", "height": "fit-content", "text": "水平扩展（较难）", "fontSize": 11, "textColor": "#1F2329" }
      ]},
    { "type": "frame", "layout": "horizontal", "gap": 6, "padding": 0, "alignItems": "center",
      "children": [
        { "type": "icon", "name": "close-circle", "width": 14, "height": 14, "color": "#D25D5A" },
        { "type": "text", "width": "fit-content", "height": "fit-content", "text": "Schema-free", "fontSize": 11, "textColor": "#1F2329" }
      ]}
  ]
}
```

### 场景标签

适合：适用场景、推荐用途。

多个 badge 并排或换行：

```json
{
  "type": "frame", "layout": "horizontal", "gap": 4, "padding": [10, 14],
  "width": "fill-container", "height": "fit-content",
  "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 8,
  "children": [
    { "type": "frame", "layout": "horizontal", "padding": [2, 8],
      "fillColor": "#F0F4FC", "borderColor": "#5178C6", "borderWidth": 1, "borderRadius": 4,
      "children": [
        { "type": "text", "text": "电商", "fontSize": 10, "width": "fit-content", "height": "fit-content", "textColor": "#5178C6" }
      ]},
    { "type": "frame", "layout": "horizontal", "padding": [2, 8],
      "fillColor": "#F0F4FC", "borderColor": "#5178C6", "borderWidth": 1, "borderRadius": 4,
      "children": [
        { "type": "text", "text": "金融", "fontSize": 10, "width": "fit-content", "height": "fit-content", "textColor": "#5178C6" }
      ]}
  ]
}
```

### 纯文本

适合：简短描述、补充说明。文本超过 15 字用 `textAlign: "left"`。

```json
{
  "type": "frame", "layout": "vertical", "gap": 0, "padding": [10, 14],
  "width": "fill-container", "height": "fit-content",
  "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 8,
  "children": [
    { "type": "text", "width": "fill-container", "height": "fit-content",
      "text": "支持 MVCC 多版本并发控制，行级锁粒度细", "fontSize": 12, "textColor": "#1F2329", "textAlign": "left" }
  ]
}
```

## Layout 规则

### 表格模式（3+ 维度）

- **根节点**：`layout: "vertical"`，固定 `width`（1000-1200），`height: "fit-content"`
- **列头行**：horizontal frame，第一格为维度标题（深色底），其余格为对比对象（复合卡片：icon + 名称 + 定位描述）
- **数据行**：horizontal frame，`alignItems: "stretch"`，第一格为维度名（左对齐、bold），其余格为子图区域
- 所有数据格 `width: "fill-container"` 等分列宽
- 行间 `gap: 12`，行内 `gap: 8`
- 维度名列固定宽度 120-160，数据列 `fill-container` 等分
- 每列用不同分组色的 borderColor 区分对象

### 分栏卡片模式（1-2 个维度）

- **根节点**：`layout: "horizontal"`，`gap: 16`，`alignItems: "stretch"`
- 每张卡片 `width: "fill-container"`（等分），内部 `layout: "vertical"`
- 卡片头部：icon + 名称 + 副标题
- 卡片内容区：根据维度自由组合区域类型
- 不需要维度标签列——维度信息作为卡片内的分区标题

## 骨架示例

### 表格模式（3 列 × 4 维度）

```json
{
  "version": 2,
  "nodes": [
    {
      "type": "frame", "width": 1100, "height": "fit-content",
      "layout": "vertical", "gap": 12, "padding": 24,
      "children": [
        { "type": "text", "width": "fill-container", "height": "fit-content",
          "text": [{"content": "[对比图标题]", "bold": true, "fontSize": 24}],
          "textAlign": "center", "textColor": "#1F2329" },

        { "type": "frame", "width": "fill-container", "height": "fit-content",
          "layout": "horizontal", "gap": 8, "padding": 0, "alignItems": "stretch",
          "children": [
            { "type": "rect", "width": 140, "height": "fit-content",
              "text": "[维度]", "fontSize": 14, "textAlign": "center", "verticalAlign": "middle",
              "fillColor": "#1F2329", "borderColor": "#1F2329", "borderWidth": 2, "borderRadius": 8, "textColor": "#FFFFFF" },
            { "type": "frame", "width": "fill-container", "height": "fit-content",
              "layout": "horizontal", "gap": 8, "padding": [8, 12], "alignItems": "center",
              "fillColor": "#F0F4FC", "borderColor": "#5178C6", "borderWidth": 2, "borderRadius": 8,
              "children": [
                { "type": "icon", "name": "[图标]", "width": 24, "height": 24, "color": "#5178C6" },
                { "type": "frame", "layout": "vertical", "gap": 2, "padding": 0, "children": [
                  { "type": "text", "width": "fit-content", "height": "fit-content",
                    "text": [{"content": "[对象A]", "bold": true, "fontSize": 14}], "textColor": "#1F2329" },
                  { "type": "text", "width": "fit-content", "height": "fit-content",
                    "text": "[一句话定位]", "fontSize": 10, "textColor": "#646A73" }
                ]}
              ]},
            { "type": "frame", "width": "fill-container", "height": "fit-content",
              "layout": "horizontal", "gap": 8, "padding": [8, 12], "alignItems": "center",
              "fillColor": "#EAE2FE", "borderColor": "#8569CB", "borderWidth": 2, "borderRadius": 8,
              "children": [
                { "type": "icon", "name": "[图标]", "width": 24, "height": 24, "color": "#8569CB" },
                { "type": "frame", "layout": "vertical", "gap": 2, "padding": 0, "children": [
                  { "type": "text", "width": "fit-content", "height": "fit-content",
                    "text": [{"content": "[对象B]", "bold": true, "fontSize": 14}], "textColor": "#1F2329" },
                  { "type": "text", "width": "fit-content", "height": "fit-content",
                    "text": "[一句话定位]", "fontSize": 10, "textColor": "#646A73" }
                ]}
              ]},
            { "type": "frame", "width": "fill-container", "height": "fit-content",
              "layout": "horizontal", "gap": 8, "padding": [8, 12], "alignItems": "center",
              "fillColor": "#DFF5E5", "borderColor": "#509863", "borderWidth": 2, "borderRadius": 8,
              "children": [
                { "type": "icon", "name": "[图标]", "width": 24, "height": 24, "color": "#509863" },
                { "type": "frame", "layout": "vertical", "gap": 2, "padding": 0, "children": [
                  { "type": "text", "width": "fit-content", "height": "fit-content",
                    "text": [{"content": "[对象C]", "bold": true, "fontSize": 14}], "textColor": "#1F2329" },
                  { "type": "text", "width": "fit-content", "height": "fit-content",
                    "text": "[一句话定位]", "fontSize": 10, "textColor": "#646A73" }
                ]}
              ]}
          ]
        },

        { "type": "frame", "width": "fill-container", "height": "fit-content",
          "layout": "horizontal", "gap": 8, "padding": 0, "alignItems": "stretch",
          "children": [
            { "type": "frame", "width": 140, "height": "fit-content",
              "layout": "vertical", "gap": 0, "padding": [10, 14], "justifyContent": "center",
              "children": [
                { "type": "text", "width": "fill-container", "height": "fit-content",
                  "text": [{"content": "[维度1]", "bold": true, "fontSize": 13}], "textColor": "#1F2329" }
              ]},
            "// 每格替换为合适的区域类型：评级Badge / 指标条 / 迷你图示 / 特性清单 / 场景标签 / 纯文本",
            { "type": "frame", "width": "fill-container", "height": "fit-content", "layout": "vertical", "gap": 6, "padding": [10, 14], "fillColor": "#FFFFFF", "borderColor": "#C2D3EE", "borderWidth": 1, "borderRadius": 8, "children": ["[区域内容]"] },
            { "type": "frame", "width": "fill-container", "height": "fit-content", "layout": "vertical", "gap": 6, "padding": [10, 14], "fillColor": "#FFFFFF", "borderColor": "#CFC4E6", "borderWidth": 1, "borderRadius": 8, "children": ["[区域内容]"] },
            { "type": "frame", "width": "fill-container", "height": "fit-content", "layout": "vertical", "gap": 6, "padding": [10, 14], "fillColor": "#FFFFFF", "borderColor": "#C8E6CF", "borderWidth": 1, "borderRadius": 8, "children": ["[区域内容]"] }
          ]
        },

        { "type": "frame", "width": "fill-container", "height": "fit-content",
          "layout": "horizontal", "gap": 8, "padding": 0, "alignItems": "stretch",
          "children": [
            { "type": "frame", "width": 140, "height": "fit-content",
              "layout": "vertical", "gap": 0, "padding": [10, 14], "justifyContent": "center",
              "children": [
                { "type": "text", "width": "fill-container", "height": "fit-content",
                  "text": [{"content": "[维度2]", "bold": true, "fontSize": 13}], "textColor": "#1F2329" }
              ]},
            { "type": "frame", "width": "fill-container", "height": "fit-content", "layout": "vertical", "gap": 6, "padding": [10, 14], "fillColor": "#FFFFFF", "borderColor": "#C2D3EE", "borderWidth": 1, "borderRadius": 8, "children": ["[区域内容]"] },
            { "type": "frame", "width": "fill-container", "height": "fit-content", "layout": "vertical", "gap": 6, "padding": [10, 14], "fillColor": "#FFFFFF", "borderColor": "#CFC4E6", "borderWidth": 1, "borderRadius": 8, "children": ["[区域内容]"] },
            { "type": "frame", "width": "fill-container", "height": "fit-content", "layout": "vertical", "gap": 6, "padding": [10, 14], "fillColor": "#FFFFFF", "borderColor": "#C8E6CF", "borderWidth": 1, "borderRadius": 8, "children": ["[区域内容]"] }
          ]
        }
      ]
    }
  ]
}
```

> **骨架中的 `"[区域内容]"` 是占位符**，生成实际 DSL 时替换为上方 6 种区域类型之一。同一行内各列应使用相同的区域类型，保持对齐可比性。

## 陷阱

- **全部用纯文字单元格**：这是最常见的错误。如果所有格子只有文字，不如用 markdown 表格。至少应有 1-2 行使用评级 badge、指标条或图示
- **维度太多导致每格太扁**：合并相关维度，控制 3-6 行。每格需要足够高度放子图
- **列数太多导致每列太窄**：对比对象 ≤ 5 列（含维度列）。迷你图示需要 ≥ 200px 列宽才有可读性
- **迷你图示过于复杂**：图示传达模式差异即可（3-5 个元素），不要在格子内塞完整架构图
- **同行单元格不等高**：每行 frame 必须 `alignItems: "stretch"`
- **维度名太长**：维度名控制在 4-6 字，必要时用缩写
- **列头没有视觉区分**：列头必须用复合卡片（icon + 名称 + 定位），不要纯文字 rect
