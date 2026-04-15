/**
 * Primitive Components — 1:1 mapping to DSL node types
 *
 * Each component is a pure function: props → DSL JSON object.
 * No React/DOM dependency. JSX is compiled via the custom jsx-runtime.
 */

import { normalizeChildren } from './jsx-runtime.js';
import { parseMarkdownText } from './markdown-text.js';
import {
  setTheme,
  getTheme,
  spacing,
  connectorDefaults,
  type ConnectorVariant,
} from './theme.js';
import type {
  WhiteboardProps,
  FrameProps,
  HStackProps,
  VStackProps,
  DagreGraphProps,
  ShapeBaseProps,
  RectProps,
  EllipseProps,
  DiamondProps,
  TriangleProps,
  CylinderProps,
  TrapezoidProps,
  TextProps,
  StickyNoteProps,
  ConnectorProps,
  SvgProps,
  ImageProps,
  IconProps,
} from './types.js';
import type { WBDocument, WBNode } from '@larksuite/whiteboard-cli/auto-layout-dsl/types';

// ─── Internal Helpers ───────────────────────────────────────────────────────

/** Flatten children into a DSL-compatible array, filtering nulls. */
function flattenChildren(children: unknown): WBNode[] {
  const normalized = normalizeChildren(children);
  return normalized.filter((c): c is WBNode => c != null && typeof c === 'object') as WBNode[];
}

/**
 * Recursively collect connector nodes from the tree and separate them.
 * Connectors must be at document top-level in the DSL.
 */
function liftConnectors(nodes: WBNode[]): { topLevel: WBNode[]; connectors: WBNode[] } {
  const topLevel: WBNode[] = [];
  const connectors: WBNode[] = [];

  for (const node of nodes) {
    if (isConnector(node)) {
      connectors.push(node);
    } else {
      if (hasChildren(node) && node.children) {
        const lifted = liftConnectors(node.children as WBNode[]);
        connectors.push(...lifted.connectors);
        topLevel.push({ ...node, children: lifted.topLevel } as WBNode);
      } else {
        topLevel.push(node);
      }
    }
  }

  return { topLevel, connectors };
}

function isConnector(node: unknown): boolean {
  return typeof node === 'object' && node !== null && (node as any).type === 'connector';
}

function hasChildren(node: unknown): node is { children: unknown[] } {
  return typeof node === 'object' && node !== null && Array.isArray((node as any).children);
}

/** Strip undefined values from an object (clean JSON output). */
function clean<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v;
  }
  return result as T;
}

/** Process text prop through markdown parser. */
function processText(text: string | undefined): string | unknown[] | undefined {
  if (text == null) return undefined;
  return parseMarkdownText(text);
}

// ─── Whiteboard (Root Component) ────────────────────────────────────────────

export function Whiteboard(props: WhiteboardProps): WBDocument {
  const { theme = 'classic', children } = props;
  setTheme(theme);

  const nodes = flattenChildren(children);
  const { topLevel, connectors } = liftConnectors(nodes);

  return {
    version: 2,
    nodes: [...topLevel, ...connectors],
  };
}

// ─── Frame ──────────────────────────────────────────────────────────────────

export function Frame(props: FrameProps): WBNode {
  const { children, layout, layoutOptions, ...rest } = props;
  return clean({
    type: 'frame' as const,
    layout,
    layoutOptions,
    ...rest,
    children: children ? flattenChildren(children) : undefined,
  }) as WBNode;
}

// ─── HStack ─────────────────────────────────────────────────────────────────

export function HStack(props: HStackProps): WBNode {
  const { children, gap = spacing.md, width = 'fill-container', height = 'fit-content', ...rest } = props;
  return clean({
    type: 'frame' as const,
    layout: 'horizontal' as const,
    gap,
    width,
    height,
    ...rest,
    children: flattenChildren(children),
  }) as WBNode;
}

// ─── VStack ─────────────────────────────────────────────────────────────────

export function VStack(props: VStackProps): WBNode {
  const { children, gap = spacing.md, width = 'fill-container', height = 'fit-content', ...rest } = props;
  return clean({
    type: 'frame' as const,
    layout: 'vertical' as const,
    gap,
    width,
    height,
    ...rest,
    children: flattenChildren(children),
  }) as WBNode;
}

// ─── DagreGraph ─────────────────────────────────────────────────────────────

export function DagreGraph(props: DagreGraphProps): WBNode {
  const {
    children,
    edges,
    rankdir = 'TB',
    align,
    nodesep = 60,
    edgesep,
    ranksep = 100,
    isCluster,
    clusterTitle,
    clusterTitleColor,
    ...rest
  } = props;

  return clean({
    type: 'frame' as const,
    layout: 'dagre' as const,
    layoutOptions: clean({
      edges,
      rankdir,
      align,
      nodesep,
      edgesep,
      ranksep,
      isCluster,
      clusterTitle,
      clusterTitleColor,
    }),
    ...rest,
    children: flattenChildren(children),
  }) as WBNode;
}

// ─── Shape Components ───────────────────────────────────────────────────────

function makeShape(type: string, props: ShapeBaseProps & Record<string, unknown>): WBNode {
  const { text, ...rest } = props;
  return clean({
    type,
    ...rest,
    text: processText(text as string | undefined),
  }) as WBNode;
}

export function Rect(props: RectProps): WBNode {
  return makeShape('rect', props);
}

export function Ellipse(props: EllipseProps): WBNode {
  return makeShape('ellipse', props);
}

export function Diamond(props: DiamondProps): WBNode {
  return makeShape('diamond', props);
}

export function Triangle(props: TriangleProps): WBNode {
  return makeShape('triangle', props);
}

export function Cylinder(props: CylinderProps): WBNode {
  return makeShape('cylinder', props);
}

export function Trapezoid(props: TrapezoidProps): WBNode {
  return makeShape('trapezoid', props);
}

// ─── Text ───────────────────────────────────────────────────────────────────

export function Text(props: TextProps): WBNode {
  const { text, children, ...rest } = props;
  // Support text as prop or as children string
  const content = text ?? (typeof children === 'string' ? children : undefined);
  return clean({
    type: 'text' as const,
    ...rest,
    text: processText(content),
  }) as WBNode;
}

// ─── StickyNote ─────────────────────────────────────────────────────────────

export function StickyNote(props: StickyNoteProps): WBNode {
  const { text, ...rest } = props;
  return clean({
    type: 'stickyNote' as const,
    ...rest,
    text: processText(text),
  }) as WBNode;
}

// ─── Connector ──────────────────────────────────────────────────────────────

export function Connector(props: ConnectorProps): WBNode {
  const {
    id,
    from,
    to,
    fromAnchor,
    toAnchor,
    variant = 'secondary',
    lineShape,
    lineColor,
    lineWidth,
    lineStyle,
    startArrow,
    endArrow,
    waypoints,
    label,
    labelPosition,
  } = props;

  const theme = getTheme();
  const defaults = connectorDefaults[variant];

  return clean({
    type: 'connector' as const,
    id,
    connector: clean({
      from,
      to,
      fromAnchor,
      toAnchor,
      lineShape,
      lineColor: lineColor ?? theme.connector.color,
      lineWidth: lineWidth ?? defaults.lineWidth,
      lineStyle: lineStyle ?? defaults.lineStyle,
      startArrow,
      endArrow,
      waypoints,
      label,
      labelPosition,
    }),
  }) as WBNode;
}

// ─── Svg ────────────────────────────────────────────────────────────────────

export function Svg(props: SvgProps): WBNode {
  const { code, ...rest } = props;
  return clean({
    type: 'svg' as const,
    ...rest,
    svg: { code },
  }) as WBNode;
}

// ─── Image ──────────────────────────────────────────────────────────────────

export function Image(props: ImageProps): WBNode {
  const { src, ...rest } = props;
  return clean({
    type: 'image' as const,
    ...rest,
    image: { src },
  }) as WBNode;
}

// ─── Icon ───────────────────────────────────────────────────────────────────

export function Icon(props: IconProps): WBNode {
  return clean({
    type: 'icon' as const,
    ...props,
  }) as WBNode;
}
