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
} from '@larksuite/whiteboard-cli/auto-layout-dsl/types';
import type { ThemeName, ColorGroupName, ConnectorVariant } from './theme.js';

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
