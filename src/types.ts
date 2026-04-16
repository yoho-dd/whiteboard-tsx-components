/**
 * Component Props Type Definitions
 *
 * All types reuse the existing DSL types from auto-layout-dsl/types.ts.
 * Container components have `children`; leaf components don't.
 */

import type {
  WBSizeValue,
  WBAnchor,
  WBArrowType,
  WBDagreLayoutOptions,
  StickyNoteFillColor,
} from './auto-layout-dsl/types.js';
import type { ThemeName, ColorGroupName, ConnectorVariant, ColorGroup } from './theme.js';

// ─── Children Type ──────────────────────────────────────────────────────────

export type ComponentChild = unknown;
export type ComponentChildren = ComponentChild | ComponentChild[];

// ─── Whiteboard (Root) ──────────────────────────────────────────────────────

export interface WhiteboardProps {
  theme?: ThemeName;
  children: ComponentChildren;
}

// ─── Frame Base (shared by Frame, HStack, VStack) ───────────────────────────

export interface FrameBaseProps {
  id?: string;
  x?: number;
  y?: number;
  width?: WBSizeValue;
  height?: WBSizeValue;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  flex?: number;
  gap?: number;
  padding?: number | [number, number] | [number, number, number, number];
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
}

// ─── Container Components ───────────────────────────────────────────────────

export interface FrameProps extends FrameBaseProps {
  layout?: 'horizontal' | 'vertical' | 'none' | 'dagre';
  layoutOptions?: WBDagreLayoutOptions;
  children?: ComponentChildren;
}

export interface HStackProps extends FrameBaseProps {
  children: ComponentChildren;
}

export interface VStackProps extends FrameBaseProps {
  children: ComponentChildren;
}

export interface DagreGraphProps extends FrameBaseProps {
  edges?: WBDagreLayoutOptions['edges'];
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  align?: 'UL' | 'UR' | 'DL' | 'DR';
  nodesep?: number;
  edgesep?: number;
  ranksep?: number;
  isCluster?: boolean;
  clusterTitle?: string;
  clusterTitleColor?: string;
  children: ComponentChildren;
}

// ─── Shape Components ───────────────────────────────────────────────────────

export interface ShapeBaseProps {
  id?: string;
  x?: number;
  y?: number;
  width?: WBSizeValue;
  height?: WBSizeValue;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  /** Plain text or markdown-enhanced string */
  text?: string;
  fontSize?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  opacity?: number;
  /** @deprecated Shapes are leaf nodes. Use Frame/Card for nested content. */
  children?: ComponentChildren;
  /** @deprecated Shapes are leaf nodes. Use Frame/Card for nested content. */
  contentLayout?: 'horizontal' | 'vertical';
  /** @deprecated Shapes are leaf nodes. Use Frame/Card for nested content. */
  contentGap?: number;
  /** @deprecated Shapes are leaf nodes. Use Frame/Card for nested content. */
  contentPadding?: number | [number, number] | [number, number, number, number];
  /** @deprecated Shapes are leaf nodes. Use Frame/Card for nested content. */
  contentAlignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** @deprecated Shapes are leaf nodes. Use Frame/Card for nested content. */
  contentJustifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}

export interface RectProps extends ShapeBaseProps {}
export interface EllipseProps extends ShapeBaseProps {}
export interface DiamondProps extends ShapeBaseProps {}
export interface CylinderProps extends ShapeBaseProps {}

export interface TriangleProps extends ShapeBaseProps {
  topWidth?: number;
}

export interface TrapezoidProps extends ShapeBaseProps {
  topWidth?: number;
}

// ─── Text ───────────────────────────────────────────────────────────────────

export interface TextProps {
  id?: string;
  x?: number;
  y?: number;
  width?: WBSizeValue;
  height?: WBSizeValue;
  /** Plain text or markdown-enhanced string */
  text?: string;
  fontSize?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  /** Alternative: pass text as children (string only) */
  children?: string;
}

// ─── StickyNote ─────────────────────────────────────────────────────────────

export interface StickyNoteProps {
  id?: string;
  x?: number;
  y?: number;
  width?: WBSizeValue;
  height?: WBSizeValue;
  text?: string;
  fontSize?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  fillColor?: StickyNoteFillColor;
}

// ─── Connector ──────────────────────────────────────────────────────────────

export interface ConnectorProps {
  id?: string;
  from: string | { x: number; y: number };
  to: string | { x: number; y: number };
  fromAnchor?: WBAnchor;
  toAnchor?: WBAnchor;
  /** Semantic variant: applies default lineWidth + lineStyle from theme */
  variant?: ConnectorVariant;
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

// ─── Embedded Content ───────────────────────────────────────────────────────

export interface SvgProps {
  id?: string;
  x?: number;
  y?: number;
  width?: WBSizeValue;
  height?: WBSizeValue;
  code: string;
  opacity?: number;
}

export interface ImageProps {
  id?: string;
  x?: number;
  y?: number;
  width?: WBSizeValue;
  height?: WBSizeValue;
  src: string;
  opacity?: number;
}

export interface IconProps {
  id?: string;
  x?: number;
  y?: number;
  width?: WBSizeValue;
  height?: WBSizeValue;
  name: string;
  color?: string;
  opacity?: number;
}

// ─── Composite Components ───────────────────────────────────────────────────

export interface CardProps {
  id: string;
  /** Card title (supports markdown-enhanced syntax) */
  title: string;
  /** Card subtitle (supports markdown-enhanced syntax) */
  subtitle?: string;
  /** Color group from theme (auto-applies fill/border/text colors) */
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  height?: WBSizeValue;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  /** Optional children (e.g., Badge) rendered below subtitle */
  children?: ComponentChildren;
}

export interface IconCardProps {
  id: string;
  /** Icon name from built-in catalog */
  icon: string;
  /** Icon color override */
  iconColor?: string;
  title: string;
  subtitle?: string;
  /** 'horizontal' = icon left (Model A), 'vertical' = icon top (Model B) */
  direction?: 'horizontal' | 'vertical';
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  height?: WBSizeValue;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  /** Optional nested content rendered below the title area */
  children?: ComponentChildren;
}

export interface BadgeProps {
  /** Badge text (supports markdown-enhanced syntax) */
  text: string;
  colorGroup?: ColorGroupName;
  fillColor?: string;
  textColor?: string;
  fontSize?: number;
  borderRadius?: number;
}

export interface SectionProps extends FrameBaseProps {
  /** Section title (supports markdown-enhanced syntax) */
  title: string;
  /** Section title font size */
  titleFontSize?: number;
  /** Color group from theme (auto-applies bg/border colors) */
  colorGroup?: ColorGroupName;
  children: ComponentChildren;
}

export interface LabeledRowProps extends FrameBaseProps {
  /** Label text (supports markdown-enhanced syntax) */
  label: string;
  /** Label column width in pixels */
  labelWidth?: number;
  colorGroup?: ColorGroupName;
  children: ComponentChildren;
}

// ─── DetailCard ────────────────────────────────────────────────────────────

export interface DetailCardEntry {
  /** Key label (supports markdown) */
  key: string;
  /** Value text (supports markdown) */
  value: string;
}

export interface DetailCardProps {
  id: string;
  /** Header icon name */
  icon?: string;
  /** Header icon color override */
  iconColor?: string;
  /** Header title (supports markdown) */
  title: string;
  /** Header subtitle (supports markdown) */
  subtitle?: string;
  /** Key-value entries in body section */
  entries?: DetailCardEntry[];
  /** Arbitrary body children (rendered after entries) */
  children?: ComponentChildren;
  /** Footer children (badges, metadata) */
  footer?: ComponentChildren;
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  height?: WBSizeValue;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

// ─── Table ─────────────────────────────────────────────────────────────────

/** A table cell: string for text, or any component(s) */
export type TableCell = string | ComponentChildren;

export interface TableProps {
  id?: string;
  /** Column header strings (supports markdown) */
  headers?: string[];
  /** 2D array of cells — strings auto-wrap as Text, components placed directly */
  rows: TableCell[][];
  /** Column widths: number for fixed px, 'fill' for fill-container */
  columnWidths?: (number | 'fill')[];
  /** Text alignment per column (applies to string cells only) */
  columnAligns?: ('left' | 'center' | 'right')[];
  /** Enable alternating row background colors */
  striped?: boolean;
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  fillColor?: string;
  borderColor?: string;
  borderRadius?: number;
}

// ─── BulletList ────────────────────────────────────────────────────────────

export interface BulletListItem {
  /** Item text (supports markdown) */
  text: string;
  /** Optional icon name (overrides bullet/number) */
  icon?: string;
}

export interface BulletListProps {
  id?: string;
  /** List items — strings or objects with text+icon */
  items: (string | BulletListItem)[];
  /** Numbered list vs bullet */
  ordered?: boolean;
  /** Bullet character override (default: "\u2022") */
  bullet?: string;
  /** Starting number for ordered lists */
  startNumber?: number;
  colorGroup?: ColorGroupName;
  /** Gap between items */
  gap?: number;
  /** Font size for items */
  fontSize?: number;
  width?: WBSizeValue;
}

// ─── Divider ───────────────────────────────────────────────────────────────

export interface DividerProps {
  id?: string;
  /** Horizontal (default) or vertical */
  direction?: 'horizontal' | 'vertical';
  /** Line color */
  color?: string;
  /** Line thickness in px */
  thickness?: number;
  /** Dash style */
  dash?: 'solid' | 'dashed' | 'dotted';
  /** Optional centered label text */
  label?: string;
  /** Label font size */
  labelFontSize?: number;
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  height?: WBSizeValue;
}

// ─── Pipeline ──────────────────────────────────────────────────────────────

export interface PipelineStep {
  id: string;
  /** Step title (supports markdown) */
  title: string;
  /** Step subtitle (supports markdown) */
  subtitle?: string;
  /** Icon name */
  icon?: string;
  /** Arbitrary content inside the step */
  children?: ComponentChildren;
}

export interface PipelineProps {
  id?: string;
  /** Pipeline steps */
  steps: PipelineStep[];
  /** Flow direction */
  direction?: 'horizontal' | 'vertical';
  /** Connector variant between steps */
  connectorVariant?: ConnectorVariant;
  /** Gap between steps */
  gap?: number;
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  height?: WBSizeValue;
}

// ─── Legend ─────────────────────────────────────────────────────────────────

export interface LegendItem {
  /** Color swatch hex */
  color: string;
  /** Label text (supports markdown) */
  label: string;
}

export interface LegendProps {
  id?: string;
  /** Legend title (supports markdown) */
  title?: string;
  /** Legend entries */
  items: LegendItem[];
  /** Layout direction for items */
  direction?: 'horizontal' | 'vertical';
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  fillColor?: string;
  borderColor?: string;
  borderRadius?: number;
}

// ─── Figure ────────────────────────────────────────────────────────────────

export interface FigureProps {
  id?: string;
  /** Figure number/label, e.g. "Figure 1" or "Fig. 3a" */
  label?: string;
  /** Figure title (supports markdown) */
  title?: string;
  /** Figure content — any components */
  children: ComponentChildren;
  /** Caption text below the figure (supports markdown) */
  caption?: string;
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number | [number, number] | [number, number, number, number];
}

// ─── Callout ───────────────────────────────────────────────────────────────

export type CalloutVariant = 'info' | 'warning' | 'success' | 'note';

export interface CalloutProps {
  id?: string;
  /** Callout variant — determines icon and colorGroup mapping */
  variant?: CalloutVariant;
  /** Title (supports markdown) */
  title?: string;
  /** Body text (supports markdown) */
  body?: string;
  /** Icon override (default derived from variant) */
  icon?: string;
  /** Arbitrary children below body */
  children?: ComponentChildren;
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  fillColor?: string;
  borderColor?: string;
  borderRadius?: number;
}

// ─── Template Layer ────────────────────────────────────────────────────────

export type TemplateShapeType =
  | 'rect'
  | 'ellipse'
  | 'diamond'
  | 'triangle'
  | 'cylinder'
  | 'trapezoid';

export interface TemplateShapeSpec extends Omit<ShapeBaseProps, 'children'> {
  /** Shape shell used to wrap nested content */
  type?: TemplateShapeType;
}

export interface TemplateNodeBase {
  id: string;
  title?: string;
  subtitle?: string;
  colorGroup?: ColorGroupName;
  width?: WBSizeValue;
  height?: WBSizeValue;
  /** Pre-rendered component body used directly as the node shell */
  component?: ComponentChildren;
  /** Extra nested content rendered inside the chosen shell */
  children?: ComponentChildren;
  /** Optional shape shell for the node */
  shape?: TemplateShapeType | TemplateShapeSpec;
}

export interface ArchitectureTemplateNode extends TemplateNodeBase {}

export interface ArchitectureTemplateLayer {
  id?: string;
  title: string;
  label?: string;
  colorGroup?: ColorGroupName;
  direction?: 'horizontal' | 'vertical';
  nodes: ArchitectureTemplateNode[];
}

export interface ArchitectureTemplateProps {
  id?: string;
  title?: string;
  width?: WBSizeValue;
  gap?: number;
  padding?: number | [number, number] | [number, number, number, number];
  fillColor?: string;
  layers: ArchitectureTemplateLayer[];
}

export interface OrganizationChartNode extends TemplateNodeBase {
  childrenNodes?: OrganizationChartNode[];
}

export interface OrganizationChartTemplateProps {
  id?: string;
  title?: string;
  width?: WBSizeValue;
  gap?: number;
  padding?: number | [number, number] | [number, number, number, number];
  fillColor?: string;
  nodes: OrganizationChartNode[];
}

export interface SwimlaneTemplateStep extends TemplateNodeBase {}

export interface SwimlaneTemplateLane {
  id: string;
  title: string;
  colorGroup?: ColorGroupName;
  direction?: 'vertical' | 'horizontal';
  steps: SwimlaneTemplateStep[];
}

export interface SwimlaneTemplateProps {
  id?: string;
  title?: string;
  width?: WBSizeValue;
  gap?: number;
  padding?: number | [number, number] | [number, number, number, number];
  fillColor?: string;
  lanes: SwimlaneTemplateLane[];
  connectors?: ConnectorProps[];
}

export interface ComparisonTemplateColumn extends TemplateNodeBase {
  items?: ComponentChildren;
}

export interface ComparisonTemplateProps {
  id?: string;
  title?: string;
  width?: WBSizeValue;
  gap?: number;
  padding?: number | [number, number] | [number, number, number, number];
  fillColor?: string;
  columns: ComparisonTemplateColumn[];
}

export interface FlowchartTemplateNode extends TemplateNodeBase {}

export interface FlowchartTemplateProps {
  id?: string;
  title?: string;
  width?: WBSizeValue;
  gap?: number;
  padding?: number | [number, number] | [number, number, number, number];
  fillColor?: string;
  nodes: FlowchartTemplateNode[];
  edges: WBDagreLayoutOptions['edges'];
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  align?: 'UL' | 'UR' | 'DL' | 'DR';
  nodesep?: number;
  edgesep?: number;
  ranksep?: number;
}
