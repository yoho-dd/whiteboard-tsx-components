# 排版规则

## 文字层级表（字号 × 粗细 × 颜色）

文字层级由**字号、粗细、颜色**三个维度共同决定，不要只靠字号拉开层次：

| 层级 | 字号 | bold | textColor（浅底） | textColor（深底） | 用途 | 对齐 |
|------|------|------|-------------------|-------------------|------|------|
| H1 图表标题 | 24-28 | **是** | `#1F2329` | `#E2E8F0` | 每图一个 | center |
| H2 分区标签 | 16-20 | **是** | 分组 borderColor | 分组 borderColor | 层名称 | right / center |
| H3 卡片标题 | 13-15 | **是** | `#1F2329` | `#E2E8F0` | 复合卡片内标题 | center / left |
| Body 正文 | 14 | 否 | `#1F2329` | `#E2E8F0` | 节点文字 | center / left |
| Sub 副标题 | 10-12 | 否 | `#646A73` | `#64748B` | 技术栈、描述 | left |
| Meta 元信息 | 10-11 | 否 | `#8F959E` | `#475569` | 版本号、Badge | center |

规则：
- 图表整体不超过 4 个字号层级；复合卡片内部的副标题/元信息不计入整体限制
- 同级节点 fontSize 必须完全相同
- **每个复合卡片内至少 2 个文字层级**：bold 标题 + normal 副标题/描述
- 用 `WBTextRun` 的 `bold: true` 控制粗细，`color` 控制颜色，形成主次对比
- 分区标签推荐使用分组的 borderColor 作为 textColor，强化层级归属感

---

## 对齐规则

Shape 节点默认 `textAlign: 'center'` + `verticalAlign: 'middle'`（与 CSS 相反）。如需左对齐须显式声明。

| 内容类型 | 对齐方式 |
|---------|---------|
| 短文本（<=15 字） | center |
| 长文本（>15 字） | left |
| 侧标签（层名、分区名） | right |
| 图表标题 | center |
| 多行描述/段落 | left |

---

## 图表标题

用独立 text 节点，不要用 frame 的 `title` 属性。

- Flex 布局：放在最外层 frame 的第一个 child，`width: "fill-container"`
- 绝对定位：width 设为图表整体宽度，`textAlign: "center"`

---

## 标题和描述拆成两个节点

一个卡片内展示名称和描述时，用 frame 包两个 text 节点，**标题用 bold + 深色，描述用 normal + 弱化色**：

```json
{
  "type": "frame", "layout": "vertical", "gap": 4, "padding": 12,
  "width": "fill-container", "height": "fit-content",
  "borderWidth": 1, "borderRadius": 10,
  "children": [
    { "type": "text", "width": "fill-container", "height": "fit-content",
      "text": [{"content": "用户服务", "bold": true, "fontSize": 15}], "textColor": "#1F2329" },
    { "type": "text", "width": "fill-container", "height": "fit-content",
      "text": "注册登录和个人信息管理", "fontSize": 12, "textColor": "#646A73" }
  ]
}
```

---

## 图标+文字组合

icon + text 纵向排列时：icon 宽高 36-48px，下方文字 fontSize 12-13，外层 frame gap 4-8。icon 比文字大 2-3 倍时视觉比例最佳。

---

## 尺寸规则

含文字节点 `height` 必须用 `'fit-content'`（详见 [schema.md WBSizeValue](schema.md)）。

所有节点必须显式声明 `width` 和 `height`。
