/**
 * Whiteboard Component Library — Public API
 *
 * AI writes TSX using these components → CLI executes → outputs DSL JSON → renders.
 */

// ─── Primitives ─────────────────────────────────────────────────────────────

export {
  Whiteboard,
  Rect,
  Ellipse,
  Diamond,
  Triangle,
  Trapezoid,
  Cylinder,
  Frame,
  HStack,
  VStack,
  DagreGraph,
  Text,
  StickyNote,
  Connector,
  Svg,
  Image,
  Icon,
} from './primitives.js';

// ─── Composites ─────────────────────────────────────────────────────────────

export {
  Card, IconCard, Badge, Section, LabeledRow,
  Divider, BulletList, Legend, Callout, DetailCard, Table, Figure, Pipeline,
} from './composites.js';

// ─── Design Tokens ──────────────────────────────────────────────────────────

export {
  themes,
  typography,
  spacing,
  borders,
  iconSize,
  grid,
  connectorDefaults,
} from './theme.js';

// ─── JSX Runtime (re-export for convenience) ────────────────────────────────

export { Fragment } from './jsx-runtime.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type { ThemeName, ColorGroupName, ConnectorVariant, Theme, ColorGroup } from './theme.js';
export type {
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
  TrapezoidProps,
  CylinderProps,
  TextProps,
  StickyNoteProps,
  ConnectorProps,
  SvgProps,
  ImageProps,
  IconProps,
  CardProps,
  IconCardProps,
  BadgeProps,
  SectionProps,
  LabeledRowProps,
  DetailCardProps,
  DetailCardEntry,
  TableProps,
  TableCell,
  BulletListProps,
  BulletListItem,
  DividerProps,
  PipelineProps,
  PipelineStep,
  LegendProps,
  LegendItem,
  FigureProps,
  CalloutProps,
  CalloutVariant,
} from './types.js';
