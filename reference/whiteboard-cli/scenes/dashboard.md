# 数据大盘 / Dashboard

适用于：数据看板、运营日报、系统监控面板、项目总览、团队周报可视化等需要在一张图中聚合多种信息类型的场景。

Dashboard 是一种**复合图类型**：整体用 grid 分栏布局，每个卡片内部可以是不同的子图类型（富文本指标、柱状图、流程图、列表等），形成信息密度高、层次丰富的综合看板。

## Content 约束

- 卡片数量 4-8 个，按信息重要度排列
- 每张卡片有明确的标题，说明这张卡片展示什么
- 卡片类型要有变化：不要全是纯文本，至少混合 2-3 种子图类型
- 核心指标卡片（KPI）放在最显眼的位置（左上或顶部通栏）

### 卡片类型参考

| 卡片类型 | 适合展示 | 内部结构 |
|---------|---------|---------|
| **KPI 指标卡** | 关键数字、同比/环比 | 大号数字 + 趋势描述 + 可选 Badge |
| **富文本摘要** | 文字总结、要点列表 | 标题 + 多行 WBTextRun（有序/无序列表） |
| **迷你柱状图** | 分类数据对比 | 标题 + 内嵌简化柱状图（几个 rect 模拟柱体） |
| **迷你流程图** | 关键路径、状态流转 | 标题 + 内嵌 Dagre 子图或简化节点+连线 |
| **进度/状态列表** | 任务进度、模块状态 | 标题 + 多行（icon + 名称 + Badge 状态） |
| **占比分布** | 类别占比 | 标题 + 模拟条形图（横向 rect 按比例分宽） |

## Layout 选型

| 模式 | 适用条件 | 特征 |
|------|---------|------|
| **grid 等分（默认）** | 卡片重要度均等 | 2-3 列等宽，行内 `alignItems: "stretch"` 等高 |
| **主次分栏** | 有核心指标突出展示 | 左侧大卡片占 2/3 宽，右侧小卡片纵向堆叠占 1/3 |
| **通栏 + grid** | 顶部有全局指标条 | 顶部通栏 KPI 行 + 下方 grid 详情卡片 |

## Layout 规则

- **根节点**：固定宽度（1200-1400），`height: "fit-content"`，`layout: "vertical"`，`gap: 20`，`padding: 24`
- **标题区**：图表标题 + 可选副标题（日期范围、数据来源等）
- **卡片网格**：用嵌套 frame 模拟 grid
  - 每行：`layout: "horizontal"`，`gap: 16`，`alignItems: "stretch"`
  - 每列卡片：`width: "fill-container"`（等分）或固定宽度（主次分栏）
  - 行间：`gap: 16`
- **单张卡片结构**：
  ```
  frame(vertical, gap: 12, padding: 16-20, borderWidth: 1, borderRadius: 10)
    → 卡片标题（text, bold, fontSize: 14-15）
    → 卡片内容（因类型而异）
  ```
- 每张卡片 `fillColor: "#FFFFFF"`，`borderColor` 按所属分组或统一用 `#DEE0E3`
- 不同卡片可用不同分组色的 borderColor 区分类别

### 卡片设计

每张卡片是一个 frame 复合卡片（设计原则见 `schema.md`「复合卡片」）。Dashboard 卡片的通用外壳：

```json
{ "type": "frame", "layout": "vertical", "gap": 12, "padding": [16, 20],
  "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 10,
  "width": "fill-container", "height": "fit-content" }
```

卡片内部结构根据类型自由设计，以下是关键要点：

- **KPI 指标卡**：核心数字至少 fontSize 28-32、bold，趋势用 Badge 标注（↑/↓ + 百分比），辅助说明用 fontSize 10-11 弱化色
- **进度/状态列表**：每行 icon + 名称 + Badge 状态，icon 和 badge 颜色反映状态语义（绿=完成、黄=进行中、灰=未开始）
- **迷你柱状图**：3-5 个 rect 模拟柱体，高度按数据比例计算，底部加类别标签（fontSize 10），用 `alignItems: "end"` 对齐底部
- **迷你流程图**：标题 + 内嵌简化 Dagre（3-4 个节点），不要在卡片内塞完整架构图
- **富文本摘要**：标题 + 多行 WBTextRun（有序/无序列表、加粗关键词）

## 骨架示例

### 通栏 KPI + 2×2 grid

```json
{
  "version": 2,
  "nodes": [
    {
      "type": "frame", "id": "root", "x": 0, "y": 0,
      "width": 1200, "height": "fit-content",
      "layout": "vertical", "gap": 20, "padding": 24,
      "children": [
        { "type": "text", "id": "title", "width": "fill-container", "height": "fit-content",
          "text": [{"content": "[Dashboard 标题]", "bold": true, "fontSize": 24}], "textAlign": "center" },
        { "type": "text", "width": "fill-container", "height": "fit-content",
          "text": "[数据范围 / 日期 / 来源]", "fontSize": 12, "textAlign": "center", "textColor": "#8F959E" },

        {
          "type": "frame", "id": "kpi-row",
          "width": "fill-container", "height": "fit-content",
          "layout": "horizontal", "gap": 16, "padding": 0, "alignItems": "stretch",
          "children": [
            { "type": "frame", "id": "kpi-1", "width": "fill-container", "height": "fit-content",
              "layout": "vertical", "gap": 8, "padding": [16, 20],
              "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 10,
              "children": [
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": [{"content": "[指标名]", "bold": true, "fontSize": 13}], "textColor": "#646A73" },
                { "type": "text", "width": "fit-content", "height": "fit-content", "text": [{"content": "[数字]", "bold": true, "fontSize": 28}], "textColor": "#1F2329" }
              ]
            },
            { "type": "frame", "id": "kpi-2", "width": "fill-container", "height": "fit-content",
              "layout": "vertical", "gap": 8, "padding": [16, 20],
              "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 10,
              "children": [
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": [{"content": "[指标名]", "bold": true, "fontSize": 13}], "textColor": "#646A73" },
                { "type": "text", "width": "fit-content", "height": "fit-content", "text": [{"content": "[数字]", "bold": true, "fontSize": 28}], "textColor": "#1F2329" }
              ]
            },
            { "type": "frame", "id": "kpi-3", "width": "fill-container", "height": "fit-content",
              "layout": "vertical", "gap": 8, "padding": [16, 20],
              "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 10,
              "children": [
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": [{"content": "[指标名]", "bold": true, "fontSize": 13}], "textColor": "#646A73" },
                { "type": "text", "width": "fit-content", "height": "fit-content", "text": [{"content": "[数字]", "bold": true, "fontSize": 28}], "textColor": "#1F2329" }
              ]
            }
          ]
        },

        {
          "type": "frame", "id": "grid-row-1",
          "width": "fill-container", "height": "fit-content",
          "layout": "horizontal", "gap": 16, "padding": 0, "alignItems": "stretch",
          "children": [
            { "type": "frame", "id": "card-1", "width": "fill-container", "height": "fit-content",
              "layout": "vertical", "gap": 12, "padding": [16, 20],
              "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 10,
              "children": [
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": [{"content": "[卡片标题]", "bold": true, "fontSize": 14}], "textColor": "#1F2329" },
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": "[卡片内容：柱状图 / 列表 / 流程图 / 富文本]", "fontSize": 13, "textColor": "#646A73" }
              ]
            },
            { "type": "frame", "id": "card-2", "width": "fill-container", "height": "fit-content",
              "layout": "vertical", "gap": 12, "padding": [16, 20],
              "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 10,
              "children": [
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": [{"content": "[卡片标题]", "bold": true, "fontSize": 14}], "textColor": "#1F2329" },
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": "[卡片内容]", "fontSize": 13, "textColor": "#646A73" }
              ]
            }
          ]
        },

        {
          "type": "frame", "id": "grid-row-2",
          "width": "fill-container", "height": "fit-content",
          "layout": "horizontal", "gap": 16, "padding": 0, "alignItems": "stretch",
          "children": [
            { "type": "frame", "id": "card-3", "width": "fill-container", "height": "fit-content",
              "layout": "vertical", "gap": 12, "padding": [16, 20],
              "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 10,
              "children": [
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": [{"content": "[卡片标题]", "bold": true, "fontSize": 14}], "textColor": "#1F2329" },
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": "[卡片内容]", "fontSize": 13, "textColor": "#646A73" }
              ]
            },
            { "type": "frame", "id": "card-4", "width": "fill-container", "height": "fit-content",
              "layout": "vertical", "gap": 12, "padding": [16, 20],
              "fillColor": "#FFFFFF", "borderColor": "#DEE0E3", "borderWidth": 1, "borderRadius": 10,
              "children": [
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": [{"content": "[卡片标题]", "bold": true, "fontSize": 14}], "textColor": "#1F2329" },
                { "type": "text", "width": "fill-container", "height": "fit-content", "text": "[卡片内容]", "fontSize": 13, "textColor": "#646A73" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 陷阱

- **卡片类型过于单一**：不要所有卡片都是纯文本。至少混合 2-3 种子图类型（KPI + 柱状图 + 列表等），信息类型的变化才能让 Dashboard 有"看板感"而非"文档感"
- **卡片高度不一致导致参差不齐**：同行卡片必须 `alignItems: "stretch"` 保证等高；如果内容差异太大，调整卡片分组让同行卡片内容量接近
- **KPI 数字不够大**：核心数字至少 fontSize 28-32，要一眼就能看到，不要和正文一样大
- **缺少趋势/对比信息**：KPI 数字旁边应有同比/环比、趋势箭头、Badge 状态标签，光一个数字没有上下文意义
- **忘记统一卡片样式**：所有卡片统一 `borderRadius: 10`、`borderWidth: 1`、`padding: [16, 20]`，不要每张卡片参数不同
- **迷你图表过于复杂**：Dashboard 内嵌的子图应是简化版（3-5 个柱体、3-4 个流程节点），不要在卡片内塞完整的 20 节点架构图
