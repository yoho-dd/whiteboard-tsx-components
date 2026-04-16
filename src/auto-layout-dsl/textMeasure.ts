/**
 * textMeasure.ts — 精确文字尺寸测量
 *
 * 统一使用 new RenderText().typesetting() 排版算法，与渲染引擎完全一致：
 * - auto-width:   sizeMode = AUTO_WIDTH  + 超大 Rect，读 max(para.width) 和 lastPara.y+height
 * - fixed-width:  sizeMode = AUTO_HEIGHT + Rect.width = containerWidth - inset
 *
 * 调用顺序（必须先 init 再 compileDocument）：
 *   1. await wb.init()         → initWithGraphicUtils({GU, RenderText, TextProps, Rect, SizeModeEnum})
 *   2. compileDocument(doc)    → measureText()
 *   3. wb.insertNodes(payloads)
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_FONT_FAMILY = 'Noto Sans SC';
/** 节点内部文字内边距（单侧） */
export const TEXT_INSET = 12;
/** typesetting AUTO_WIDTH 模式下不折行的最大宽度限制 */
const AUTO_WIDTH_MAX = 65536;

// ─── Injected whiteboard-x modules ───────────────────────────────────────────

type Paragraph = { y: number; height: number; width: number; lines: Array<{ width: number }> };

type ContentRectLike = { width: number; height: number };

type TextPropsCtor = (new () => {
  text: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  sizeMode: number;
  textParagraphProps?: any[];
  [k: string]: any;
}) & {
  /** whiteboard-x: 根据 indent / listType 自动回填 listIndex 与 orderedListShowIndex（就地修改） */
  refreshTextParagraphPropsListIndex(arr: any[]): void;
};

type Modules = {
  GU: any;
  ctx: any;
  RenderText: new () => {
    typesetting(ctx: any, textProps: any, rect: any): void;
    paragraphs: Paragraph[];
    getContentRect?(includeParagraphSpace?: boolean): ContentRectLike;
  };
  TextProps: TextPropsCtor;
  TextParagraphProp: new () => {
    quote: boolean;
    listType: number;
    indent: number;
    listIndex: number;
    listFontSize: number;
    orderedListShowIndex: string;
    [k: string]: any;
  };
  Rect: new (x: number, y: number, w: number, h: number) => any;
  SizeModeEnum: { AUTO_WIDTH: number; AUTO_HEIGHT: number; FIXED: number };
};

let _mod: Modules | null = null;

export function initWithGraphicUtils(mod: Modules): void {
  _mod = mod;
}

function getMod(): Modules {
  if (!_mod) {
    throw new Error('[textMeasure] Not initialized. Call HeadlessWhiteboard.init() before compileDocument().');
  }
  return _mod;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface TextSizeResult {
  width: number;
  height: number;
}

export interface TextCharPropLike {
  charIndexSet: Set<number>;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  [k: string]: any;
}

export interface TextParagraphPropLike {
  quote: boolean;
  listType: number;
  indent: number;
  [k: string]: any;
}

/**
 * 把 plain object 形式的段落属性转成 whiteboard-x 的 TextParagraphProp 实例，
 * 并复用 TextProps.refreshTextParagraphPropsListIndex 自动计算 listIndex / orderedListShowIndex。
 */
function buildParagraphProps(
  textParagraphProps: TextParagraphPropLike[] | undefined,
  fontSize: number,
): any[] | undefined {
  if (!textParagraphProps || textParagraphProps.length === 0) {
    return undefined;
  }
  const { TextProps, TextParagraphProp } = getMod();

  const instances = textParagraphProps.map((pp) => {
    const inst = new TextParagraphProp();
    inst.quote = Boolean(pp.quote);
    if (pp.listType !== undefined) inst.listType = pp.listType;
    if (pp.indent !== undefined) inst.indent = pp.indent;
    inst.listFontSize = fontSize;
    return inst;
  });

  TextProps.refreshTextParagraphPropsListIndex(instances);
  return instances;
}

export interface RichTextProps {
  textCharProps?: TextCharPropLike[];
  textParagraphProps?: TextParagraphPropLike[];
}

export interface MeasureTextOptions {
  /** 文字内容（支持 \n 换行） */
  text: string | Array<{ content: string }>;
  /** 基础字号（px） */
  fontSize: number;
  /** 基础是否加粗（逐字符 bold 走 richProps.textCharProps） */
  bold?: boolean;
  /** 设置则按宽度折行（AUTO_HEIGHT），否则 AUTO_WIDTH（自然宽度） */
  containerWidth?: number;
  /** 节点类型，用于计算内边距和异形补偿 */
  nodeType?: string;
  /** 富文本属性：逐字符样式 + 段落样式（一般来自 normalizeText().richProps） */
  richProps?: RichTextProps;
}

/**
 * 测量文字的渲染尺寸 —— 统一使用 RenderText.typesetting()。
 */
export function measureText(opts: MeasureTextOptions): TextSizeResult {
  const {
    text,
    fontSize,
    bold = false,
    containerWidth,
    nodeType = 'rect',
    richProps,
  } = opts;
  const textCharProps = richProps?.textCharProps;
  const textParagraphProps = richProps?.textParagraphProps;
  const raw = typeof text === 'string' ? text : text.map(r => r.content).join('');

  // Cylinder 的文字区域受桶盖弧形影响，与 rect 不同（见 CylinderDrawer.ts）：
  //   textContentBounds = { top: 32, right: 7, bottom: 10, left: 7 }
  // rect/ellipse/diamond/triangle 等形状统一使用 TEXT_INSET = 12
  const isCylinder = nodeType === 'cylinder';
  const insetH = nodeType === 'text' ? 0 : isCylinder ? 7 : TEXT_INSET; // 水平内边距
  const insetTop = nodeType === 'text' ? 0 : isCylinder ? 32 : TEXT_INSET; // 顶部内边距
  const insetBot = nodeType === 'text' ? 0 : isCylinder ? 10 : TEXT_INSET; // 底部内边距

  const { ctx, RenderText, TextProps, Rect, SizeModeEnum } = getMod();

  const isFixed = containerWidth !== undefined;
  const innerW = isFixed ? Math.max(1, containerWidth! - insetH * 2) : AUTO_WIDTH_MAX;
  const mode = isFixed ? SizeModeEnum.AUTO_HEIGHT : SizeModeEnum.AUTO_WIDTH;

  const tp = new TextProps();
  tp.text = raw || ' ';
  tp.fontSize = fontSize;
  tp.fontFamily = DEFAULT_FONT_FAMILY;
  tp.bold = bold;
  tp.sizeMode = mode;
  if (textCharProps && textCharProps.length > 0) {
    tp.textCharProps = textCharProps;
  }
  const paragraphPropInstances = buildParagraphProps(textParagraphProps, fontSize);
  if (paragraphPropInstances && paragraphPropInstances.length > 0) {
    tp.textParagraphProps = paragraphPropInstances;
  }

  const rt = new RenderText();
  rt.typesetting(ctx, tp, new Rect(0, 0, innerW, 99999));

  const paras = rt.paragraphs;
  const contentRect = rt.getContentRect?.(true);
  // 优先使用 RenderText 自身的 contentRect，它会把 quote/list 等段落级留白一起算进去。
  const lastPara = paras[paras.length - 1];
  const contentH = contentRect?.height ?? (lastPara ? lastPara.y + lastPara.height : fontSize * 1.4);

  const h = Math.max(contentH, fontSize * 1.4) + insetTop + insetBot;

  // ── 异形几何补偿 ──────────────────────────────────────────────────────
  // 非矩形形状的文字区域远小于外框边界框。引擎中每个 Drawer 通过
  // textContentBounds (Ratio 类型) 定义了文字安全区占外框的比例，
  // 对应的 getTextExpandScale() = 1 - topRatio - bottomRatio。
  // 我们在测量时需要用 1/scale 反推出外框尺寸。
  //
  // 来源（whiteboard-x/src/graphics/drawer/）：
  //   DiamondDrawer:  top=30/120(0.25)  bottom=30/120(0.25)  → scale=0.50  → factor=2.00
  //   TriangleDrawer: top=38/76 (0.50)  bottom=8/76  (0.105) → scale=0.395 → factor=2.53
  //   EllipseDrawer:  top=12/80 (0.15)  bottom=12/80 (0.15)  → scale=0.70  → factor=1.43
  //   TrapezoidDrawer: top=8/80 (0.10) bottom=8/80 (0.10) → factorH=1.25
  //                    left=20/120(0.167) right=20/120(0.167) → factorW=1.50
  //   其他形状(rect/cylinder 等): Fixed 类型 inset，已在 insetTop/insetBot 中处理
  const TEXT_EXPAND_SCALE: Record<string, { h: number; w: number }> = {
    diamond:  { h: 1 / (1 - 30/120 - 30/120), w: 1 / (1 - 30/120 - 30/120) }, // 2.0, 2.0
    triangle: { h: 1 / (1 - 38/76 - (76-38-30)/76), w: 1 / (1 - 25/108 - (108-25-58)/108) }, // ≈2.53, ≈1.86
    ellipse:  { h: 1 / (1 - 12/80 - 12/80), w: 1 / (1 - 12/80 - 12/80) },    // ≈1.43, ≈1.43
    trapezoid: { h: 1 / (1 - 8/80 - 8/80), w: 1 / (1 - 20/120 - 20/120) },   // 1.25, 1.5
  };
  const scale = TEXT_EXPAND_SCALE[nodeType];
  const factorH = scale?.h ?? 1.0;
  const factorW = scale?.w ?? 1.0;

  if (isFixed) {
    return {
      width:  containerWidth!,
      height: h * factorH,
    };
  } else {
    // 宽度优先取 RenderText 的 contentRect，以便包含 quote/list 的段前空间。
    const contentW = contentRect?.width ?? (paras.length > 0 ? Math.max(...paras.map(p => p.width)) : fontSize * 4);
    return {
      width:  ((raw ? contentW : fontSize * 4) + insetH * 2) * factorW,
      height: h * factorH,
    };
  }
}
