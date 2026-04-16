// ─── Primitive types ────────────────────────────────────────────────────────────

/**
 * Sizing value for width/height.
 * - number: fixed pixels (border-box — includes border width)
 * - 'fit-content': auto-size from text content or children
 * - 'fit-content(N)': same, but fallback = N px when no text/children
 * - 'fill-container': fill parent's remaining space on main axis
 * - 'fill-container(N)': same, but fallback = N px when parent has no Flex layout
 */
export type WBSizeValue = number | string;

// ─── Text run ────────────────────────────────────────────────────────────────

export interface WBTextRun {
  content: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikeThrough?: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  hyperlink?: string;
  listType?: 'none' | 'ordered' | 'unordered';
  indent?: number;
  quote?: boolean;
}

// ─── Connector ───────────────────────────────────────────────────────────────

export type WBConnectorEndpoint = string | { x: number; y: number };

export type WBAnchor = 'top' | 'right' | 'bottom' | 'left';

export type WBArrowType = 'none' | 'arrow' | 'triangle' | 'circle' | 'diamond';

export interface WBConnector {
  /** Source node id or absolute canvas coordinate. */
  from: WBConnectorEndpoint;
  /** Target node id or absolute canvas coordinate. */
  to: WBConnectorEndpoint;
  fromAnchor?: WBAnchor;
  toAnchor?: WBAnchor;
  lineShape?: 'straight' | 'curve' | 'rightAngle' | 'polyline';
  lineColor?: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  startArrow?: WBArrowType;
  endArrow?: WBArrowType;
  waypoints?: { x: number; y: number }[];
  label?: string;
  labelPosition?: number;
}

// ─── Shared mixins ───────────────────────────────────────────────────────────

/** Common fields shared by all positionable nodes. */
export interface WBEntity {
  /** Globally unique id. Required when referenced by connector.from/to, but architecturally mandatory. */
  id: string;
  /** Canvas X. Ignored when parent uses Flex layout. */
  x?: number;
  /** Canvas Y. Ignored when parent uses Flex layout. */
  y?: number;
}

/** Nodes with width/height dimensions. */
export interface WBSizable {
  width?: WBSizeValue;
  height?: WBSizeValue;
}

/** Visual styling shared by shapes and frames. */
export interface WBGraphics {
  /** Fill color, e.g. '#3B82F6' or 'transparent'. */
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
}

/** Text content fields shared by shapes, text nodes, and sticky notes. */
export interface WBTextContent {
  /** Plain string for uniform style, or WBTextRun[] for mixed rich text. */
  text?: string | WBTextRun[];
  fontSize?: number;
  fontWeight?: 'bold';
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

/** Dagre layout specific options */
export interface WBDagreLayoutOptions {
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  align?: 'UL' | 'UR' | 'DL' | 'DR';
  nodesep?: number;
  edgesep?: number;
  ranksep?: number;
  /** Topological edges: [sourceId, targetId, optionalLabel]. Engine auto-synthesizes connectors. */
  edges?: Array<[string, string] | [string, string, string]>;
  /**
   * Transparent Compound Cluster. Requires `layout: 'dagre'`.
   * When true, this frame becomes a transparent sub-graph boundary in the parent Dagre.
   * Its children participate in the parent's topology; edges can freely cross the boundary.
   * When false/unset, this frame is an opaque node — edges targeting its descendants
   * are automatically redirected to this frame itself.
   */
  isCluster?: boolean;
  clusterTitle?: string;
  clusterTitleColor?: string;
}

/** Flex layout control properties for frames. */
export interface WBLayout {
  /** Layout engine directive. Defaults to 'none' if empty. */
  layout?: 'horizontal' | 'vertical' | 'none' | 'dagre';
  /** Space between children on the main axis. Defaults to 0. */
  gap?: number;
  /** Inner padding. Defaults to 0. */
  padding?: number | [number, number] | [number, number, number, number];
  /** Main-axis alignment of children. Defaults to 'start'. */
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  /** Cross-axis alignment. 'stretch' equalizes siblings' cross-axis size. */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** Optional layout configurations specific to Dagre engine. */
  layoutOptions?: WBDagreLayoutOptions;
}

// ─── Node types ──────────────────────────────────────────────────────────────

/** Base for all basic shapes: rect, ellipse, diamond, triangle, cylinder. */
export interface WBShapeBase extends WBEntity, WBSizable, WBGraphics, WBTextContent {
  /** 0-1 opacity, only affects fillColor transparency. */
  opacity?: number;
}

export type WBShapeType = 'rect' | 'ellipse' | 'diamond' | 'triangle' | 'cylinder' | 'trapezoid';

/** A rectangle with optional rounded corners. */
export interface WBRect extends WBShapeBase {
  type: 'rect';
}

/** An ellipse defined by its bounding box. */
export interface WBEllipse extends WBShapeBase {
  type: 'ellipse';
}

/** A diamond (rhombus) shape. */
export interface WBDiamond extends WBShapeBase {
  type: 'diamond';
}

/** A triangle shape. */
export interface WBTriangle extends WBShapeBase {
  type: 'triangle';
  /**
   * The width of the top tip of the triangle (0 for a perfect point).
   * Used for perfect alignment in pyramid diagrams where trapezoids are underneath.
   */
  topWidth?: number;
}

/** A cylinder shape (used for database icons, etc.). */
export interface WBCylinder extends WBShapeBase {
  type: 'cylinder';
}

/** A trapezoid shape. */
export interface WBTrapezoid extends WBShapeBase {
  type: 'trapezoid';
  /**
   * The width of the top edge of the trapezoid.
   * If not provided, a default slope will be used.
   * Useful for perfectly aligning trapezoids in pyramid diagrams.
   */
  topWidth?: number;
}

/** A frame is a container that can have children and flex layout. */
export interface WBFrame extends WBEntity, WBSizable, WBGraphics, WBLayout {
  type: 'frame';
  children?: WBChild[];
}

/** A pure text node. */
export interface WBTextNode extends WBEntity, WBSizable, WBTextContent {
  type: 'text';
}

export const STICKY_NOTE_FILL_COLORS = [
  '#FEF1CE',
  '#F5D1A7',
  '#DFF5E5',
  '#CDF7CC',
  '#C9E8EF',
  '#D6DCF3',
  '#D3CCEE',
  '#F1C5E7',
  '#F6C8C8',
] as const;

export type StickyNoteFillColor = (typeof STICKY_NOTE_FILL_COLORS)[number];

/** A sticky note with preset fill colors and text. */
export interface WBStickyNote extends WBEntity, WBSizable, WBTextContent {
  type: 'stickyNote';
  fillColor?: StickyNoteFillColor;
}

/** A connector line between two nodes or canvas coordinates. */
export interface WBConnectorNode extends WBEntity {
  type: 'connector';
  connector: WBConnector;
}

/** An inline SVG element. */
export interface WBSvgNode extends WBEntity, WBSizable {
  type: 'svg';
  opacity?: number;
  svg: { code: string };
}

/** An embedded image element. */
export interface WBImageNode extends WBEntity, WBSizable {
  type: 'image';
  opacity?: number;
  image: { src: string };
}

/** An icon from the built-in icon library. */
export interface WBIconNode extends WBEntity, WBSizable {
  type: 'icon';
  /** Icon name from the catalog (kebab-case, e.g. "cloud-server"). */
  name: string;
  /** Optional color override, hex format (e.g. "#FF6600"). */
  color?: string;
  opacity?: number;
}

// ─── Union types ─────────────────────────────────────────────────────────────

export type WBNode =
  | WBFrame
  | WBRect
  | WBEllipse
  | WBDiamond
  | WBTriangle
  | WBCylinder
  | WBTrapezoid
  | WBTextNode
  | WBStickyNote
  | WBConnectorNode
  | WBSvgNode
  | WBImageNode
  | WBIconNode;

/** All node types that can be nested inside frame.children (connectors excluded). */
export type WBChild = Exclude<WBNode, WBConnectorNode>;

// ─── Document ────────────────────────────────────────────────────────────────

export interface WBDocument {
  version: 2;
  /** Top-level canvas nodes. Connectors MUST be here, not in frame.children. */
  nodes: WBNode[];
}
