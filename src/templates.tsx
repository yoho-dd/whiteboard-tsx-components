import { normalizeChildren } from './jsx-runtime.js';
import {
  Frame,
  HStack,
  VStack,
  DagreGraph,
  Rect,
  Ellipse,
  Diamond,
  Triangle,
  Cylinder,
  Trapezoid,
  Text,
  Connector,
} from './primitives.js';
import { Card, Section, LabeledRow } from './composites.js';
import { spacing, typography } from './theme.js';
import type {
  ArchitectureTemplateProps,
  ArchitectureTemplateNode,
  ComparisonTemplateColumn,
  ComparisonTemplateProps,
  ConnectorProps,
  FlowchartTemplateNode,
  FlowchartTemplateProps,
  OrganizationChartNode,
  OrganizationChartTemplateProps,
  SwimlaneTemplateProps,
  TemplateNodeBase,
  TemplateShapeSpec,
  TemplateShapeType,
} from './types.js';
import type { WBNode } from './auto-layout-dsl/types.js';

const DEFAULT_TEMPLATE_NODE_WIDTH = 260;

function clean<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result as T;
}

function flattenChildren(children: unknown): WBNode[] {
  const normalized = normalizeChildren(children);
  return normalized.filter((child): child is WBNode => child != null && typeof child === 'object') as WBNode[];
}

function isFillContainerValue(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith('fill-container');
}

function resolveTemplateNodeWidth(nodeWidth: unknown, shellWidth: unknown = undefined): unknown {
  if (nodeWidth !== undefined) return nodeWidth;
  if (isFillContainerValue(shellWidth)) return DEFAULT_TEMPLATE_NODE_WIDTH;
  return shellWidth ?? DEFAULT_TEMPLATE_NODE_WIDTH;
}

function makeTemplateTitle(id: string, title: string): WBNode {
  return Text({
    id,
    text: title,
    width: 'fit-content',
    height: 'fit-content',
    fontSize: typography.h1.fontSize,
    textColor: '#1F2329',
  });
}

function appendChildrenToShell(shell: WBNode, children: WBNode[], node: TemplateNodeBase): WBNode {
  if ((shell as any).type === 'frame') {
    const existing = Array.isArray((shell as any).children) ? (shell as any).children : [];
    return clean({
      ...(shell as any),
      id: node.id ?? (shell as any).id,
      width: resolveTemplateNodeWidth(node.width, (shell as any).width),
      height: node.height ?? (shell as any).height,
      children: children.length > 0 ? [...existing, ...children] : existing,
    }) as WBNode;
  }

  if (children.length === 0) {
    return clean({
      ...(shell as any),
      id: node.id ?? (shell as any).id,
    }) as WBNode;
  }

  return Frame({
    id: node.id,
    layout: 'vertical',
    width: resolveTemplateNodeWidth(node.width),
    height: 'fit-content',
    gap: spacing.sm,
    children: [shell, ...children],
  });
}

function normalizeShapeSpec(shape: TemplateNodeBase['shape']): TemplateShapeSpec {
  if (typeof shape === 'string') return { type: shape };
  return shape ?? { type: 'rect' };
}

function renderShapeNode(node: TemplateNodeBase, contentChildren: WBNode[]): WBNode {
  if (contentChildren.length > 0) {
    throw new Error(
      `Template node "${node.id}" uses shape "${normalizeShapeSpec(node.shape).type}" with nested content. Shapes are leaf nodes; use Frame/Card as the node shell and keep the shape as a leaf child instead.`,
    );
  }

  const spec = normalizeShapeSpec(node.shape);
  const type = spec.type ?? 'rect';

  const shapeProps = clean({
    ...spec,
    id: node.id,
    width: resolveTemplateNodeWidth(node.width, spec.width),
    height: node.height ?? spec.height ?? 'fit-content',
    text: node.title,
    fontSize: spec.fontSize ?? (node.subtitle ? typography.h3.fontSize : undefined),
  });

  const shapeFactory: Record<TemplateShapeType, (props: any) => WBNode> = {
    rect: Rect,
    ellipse: Ellipse,
    diamond: Diamond,
    triangle: Triangle,
    cylinder: Cylinder,
    trapezoid: Trapezoid,
  };

  return shapeFactory[type](shapeProps);
}

function renderTemplateNode(node: TemplateNodeBase): WBNode {
  const componentChildren = flattenChildren(node.component);
  const slotChildren = flattenChildren(node.children);
  const nestedChildren = [...componentChildren, ...slotChildren];

  if (node.shape) {
    return renderShapeNode(node, nestedChildren);
  }

  if (componentChildren.length > 0) {
    if (componentChildren.length === 1) {
      return appendChildrenToShell(componentChildren[0], slotChildren, node);
    }

    return Frame({
      id: node.id,
      layout: 'vertical',
      width: resolveTemplateNodeWidth(node.width),
      height: node.height ?? 'fit-content',
      gap: spacing.sm,
      children: [...componentChildren, ...slotChildren],
    });
  }

  if (node.title || node.subtitle) {
    return Card({
      id: node.id,
      title: node.title ?? node.id,
      subtitle: node.subtitle,
      colorGroup: node.colorGroup,
      width: resolveTemplateNodeWidth(node.width),
      height: node.height,
      children: slotChildren.length > 0 ? slotChildren : undefined,
    });
  }

  return Frame({
    id: node.id,
    layout: 'vertical',
    width: resolveTemplateNodeWidth(node.width),
    height: node.height ?? 'fit-content',
    gap: spacing.sm,
    padding: [spacing.sm, spacing.sm],
    children: slotChildren,
  });
}

function renderConnectorList(connectors: ConnectorProps[] | undefined): WBNode[] {
  return (connectors ?? []).map((connector) => Connector(connector));
}

export function ArchitectureTemplate(props: ArchitectureTemplateProps): WBNode {
  const {
    id,
    title,
    width = 'fit-content',
    gap = spacing.xl,
    padding = spacing.xxl,
    fillColor,
    layers,
  } = props;

  const children: WBNode[] = [];

  if (title) {
    children.push(makeTemplateTitle(`${id ?? 'architecture-template'}-title`, title));
  }

  children.push(...layers.map((layer, index) => {
    const layerNodes = layer.nodes.map(renderTemplateNode);
    const direction = layer.direction ?? 'horizontal';
    const content = direction === 'vertical'
        ? VStack({
          id: layer.id ? `${layer.id}-stack` : `architecture-layer-${index}-stack`,
          gap: spacing.lg,
          children: layerNodes,
        })
      : HStack({
          id: layer.id ? `${layer.id}-stack` : `architecture-layer-${index}-stack`,
          gap: spacing.lg,
          alignItems: 'center',
          children: layerNodes,
        });

    const sectionChildren = layer.label
      ? [
          LabeledRow({
            id: layer.id ? `${layer.id}-labeled-row` : `architecture-layer-${index}-label`,
            label: layer.label,
            colorGroup: layer.colorGroup,
            children: [content],
          }),
        ]
      : [content];

    return Section({
      id: layer.id ?? `architecture-layer-${index}`,
      title: layer.title,
      colorGroup: layer.colorGroup,
      children: sectionChildren,
    });
  }));

  return VStack({
    id,
    width,
    gap,
    padding,
    fillColor,
    children,
  });
}

function flattenOrgTree(
  nodes: OrganizationChartNode[],
  collector: { nodes: WBNode[]; edges: [string, string][] },
  parentId?: string,
): void {
  for (const node of nodes) {
    collector.nodes.push(renderTemplateNode(node));
    if (parentId) collector.edges.push([parentId, node.id]);
    if (node.childrenNodes?.length) {
      flattenOrgTree(node.childrenNodes, collector, node.id);
    }
  }
}

export function OrganizationChartTemplate(props: OrganizationChartTemplateProps): WBNode {
  const {
    id,
    title,
    width = 'fit-content',
    gap = spacing.xl,
    padding = spacing.xxl,
    fillColor,
    nodes,
  } = props;

  const collected: { nodes: WBNode[]; edges: [string, string][] } = { nodes: [], edges: [] };
  flattenOrgTree(nodes, collected);

  const children: WBNode[] = [];
  if (title) children.push(makeTemplateTitle(`${id ?? 'organization-chart'}-title`, title));
  children.push(DagreGraph({
    id: id ? `${id}-graph` : 'organization-chart-graph',
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 100,
    edges: collected.edges,
    children: collected.nodes,
  }));

  return VStack({
    id,
    width,
    gap,
    padding,
    fillColor,
    children,
  });
}

export function SwimlaneTemplate(props: SwimlaneTemplateProps): WBNode {
  const {
    id,
    title,
    width = 'fit-content',
    gap = spacing.xl,
    padding = spacing.xxl,
    fillColor,
    lanes,
    connectors,
  } = props;

  const children: WBNode[] = [];
  if (title) children.push(makeTemplateTitle(`${id ?? 'swimlane-template'}-title`, title));

  children.push(HStack({
    id: id ? `${id}-lanes` : 'swimlane-template-lanes',
    gap: spacing.lg,
    alignItems: 'stretch',
    children: lanes.map((lane) => {
      const direction = lane.direction ?? 'vertical';
      const stepChildren = lane.steps.map(renderTemplateNode);
      const laneBody = direction === 'horizontal'
        ? HStack({
            id: `${lane.id}-body`,
            gap: spacing.lg,
            alignItems: 'center',
            children: stepChildren,
          })
        : VStack({
            id: `${lane.id}-body`,
            gap: spacing.lg,
            children: stepChildren,
          });

      return Section({
        id: lane.id,
        title: lane.title,
        colorGroup: lane.colorGroup,
        width: 'fill-container',
        children: [laneBody],
      });
    }),
  }));

  children.push(...renderConnectorList(connectors));

  return VStack({
    id,
    width,
    gap,
    padding,
    fillColor,
    children,
  });
}

function renderComparisonColumn(column: ComparisonTemplateColumn): WBNode {
  const bodyChildren: WBNode[] = [];

  if (column.shape || column.component || column.children) {
    bodyChildren.push(renderTemplateNode({
      ...column,
      id: `${column.id}-content`,
      title: undefined,
      subtitle: undefined,
    }));
  }

  bodyChildren.push(...flattenChildren(column.items));

  return Section({
    id: column.id,
    title: column.title ?? column.id,
    colorGroup: column.colorGroup,
    width: column.width ?? 'fill-container',
    children: bodyChildren,
  });
}

export function ComparisonTemplate(props: ComparisonTemplateProps): WBNode {
  const {
    id,
    title,
    width = 'fit-content',
    gap = spacing.xl,
    padding = spacing.xxl,
    fillColor,
    columns,
  } = props;

  const children: WBNode[] = [];
  if (title) children.push(makeTemplateTitle(`${id ?? 'comparison-template'}-title`, title));
  children.push(HStack({
    id: id ? `${id}-columns` : 'comparison-template-columns',
    gap: spacing.lg,
    alignItems: 'stretch',
    children: columns.map(renderComparisonColumn),
  }));

  return VStack({
    id,
    width,
    gap,
    padding,
    fillColor,
    children,
  });
}

export function FlowchartTemplate(props: FlowchartTemplateProps): WBNode {
  const {
    id,
    title,
    width = 'fit-content',
    gap = spacing.xl,
    padding = spacing.xxl,
    fillColor,
    nodes,
    edges,
    rankdir = 'TB',
    align,
    nodesep = 80,
    edgesep,
    ranksep = 100,
  } = props;

  const children: WBNode[] = [];
  if (title) children.push(makeTemplateTitle(`${id ?? 'flowchart-template'}-title`, title));
  children.push(DagreGraph({
    id: id ? `${id}-graph` : 'flowchart-template-graph',
    edges,
    rankdir,
    align,
    nodesep,
    edgesep,
    ranksep,
    children: nodes.map((node: FlowchartTemplateNode) => renderTemplateNode(node)),
  }));

  return VStack({
    id,
    width,
    gap,
    padding,
    fillColor,
    children,
  });
}
