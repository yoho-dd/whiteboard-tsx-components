/**
 * layout-yoga.ts — Auto Layout DSL v2 powered by Yoga
 *
 * Replaces the custom layout.ts engine. Exports the same API:
 *   resolveLayout(), flattenResolved(), liftConnectors(), ResolvedNode
 *
 * Yoga gives us full flexbox for free, most importantly:
 *   - alignItems: stretch (same-height cards in a row)
 *   - fill-container = flex: 1 (equal-width children no manual sizing needed)
 *   - fit-content = measureFunc or auto from children
 */

import Yoga, { Node as YogaNode } from 'yoga-layout';
import dagre from 'dagre';
import type { WBDocument, WBNode, WBChild, WBFrame, WBConnectorNode, WBSizeValue, WBTextNode } from './types';
import { measureText } from './textMeasure';
import { normalizeText } from '../common/richText';

// ─── Public ResolvedNode interface (same as layout.ts) ────────────────────────

export interface ResolvedNode {
  node: WBNode;
  absX: number;
  absY: number;
  width: number;
  height: number;
  children: ResolvedNode[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 80;
const DEFAULT_ICON_SIZE = 48;
const DEFAULT_FONT_SIZE = 14;

// ─── Step 1 — Connector lift (copied unchanged from layout.ts) ────────────────

export function liftConnectors(doc: WBDocument): WBDocument {
  const lifted: WBConnectorNode[] = [];

  function walkChildren(children: WBNode[]): WBChild[] {
    const kept: WBChild[] = [];
    for (const child of children) {
      if ((child as WBNode).type === 'connector') {
        lifted.push(child as unknown as WBConnectorNode);
      } else if (child.type === 'frame' && child.children) {
        kept.push({ ...child, children: walkChildren(child.children as WBNode[]) });
      } else {
        kept.push(child as WBChild);
      }
    }
    return kept;
  }

  const cleanNodes = doc.nodes.map(n => {
    if (n.type === 'frame' && n.children) {
      return { ...n, children: walkChildren(n.children as WBNode[]) };
    }
    return n;
  });

  // Deduplicate connectors by id
  const uniqueLifted: WBConnectorNode[] = [];
  const seenIds = new Set<string>();

  for (const c of lifted) {
    if (c.id) {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        uniqueLifted.push(c);
      }
    } else {
      uniqueLifted.push(c);
    }
  }

  return { ...doc, nodes: [...cleanNodes, ...uniqueLifted] };
}

// ─── flattenResolved (same as layout.ts) ──────────────────────────────────────

export function flattenResolved(nodes: ResolvedNode[]): ResolvedNode[] {
  const out: ResolvedNode[] = [];
  function walk(n: ResolvedNode) {
    out.push(n);
    for (const c of n.children) walk(c);
  }
  for (const n of nodes) walk(n);
  return out;
}

// ─── Padding helper ───────────────────────────────────────────────────────────

interface PaddingBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type PaddingValue = number | [number, number] | [number, number, number, number] | undefined;

function parsePadding(p: PaddingValue): PaddingBox {
  if (p === undefined) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (typeof p === 'number') return { top: p, right: p, bottom: p, left: p };
  if (p.length === 2) {
    const [v, h] = p as [number, number];
    return { top: v, right: h, bottom: v, left: h };
  }
  const [t, r, b, l] = p as [number, number, number, number];
  return { top: t, right: r, bottom: b, left: l };
}

// ─── Size parser ──────────────────────────────────────────────────────────────

type SizeKind =
  | { kind: 'fixed'; value: number }
  | { kind: 'fit-content'; fallback?: number }
  | { kind: 'fill-container'; fallback?: number };

function parseSizeValue(val: WBSizeValue | undefined, defaultValue: number): SizeKind {
  if (val === undefined) return { kind: 'fixed', value: defaultValue };
  if (typeof val === 'number') return { kind: 'fixed', value: val };
  const m = val.match(/^(fit-content|fill-container)(?:\((\d+(?:\.\d+)?)\))?$/);
  if (!m) return { kind: 'fixed', value: defaultValue };
  const fallback = m[2] !== undefined ? parseFloat(m[2]) : undefined;
  return { kind: m[1] as 'fit-content' | 'fill-container', fallback };
}

// ─── Apply size to a Yoga node axis ──────────────────────────────────────────

function applySize(
  yn: YogaNode,
  val: WBSizeValue | undefined,
  defaultValue: number,
  axis: 'width' | 'height',
): SizeKind {
  const kind = parseSizeValue(val, defaultValue);
  if (kind.kind === 'fixed') {
    if (axis === 'width') yn.setWidth(kind.value);
    else yn.setHeight(kind.value);
  }
  // fit-content and fill-container are handled below (no explicit dimension for fit-content)
  return kind;
}

// ─── Apply fill-container to flex grow ────────────────────────────────────────

/**
 * Map fill-container → flex:1 on the MAIN axis.
 * - horizontal parent → main axis is width
 * - vertical parent   → main axis is height
 * Cross-axis fill-container is handled automatically by alignItems: stretch on
 * the parent (Yoga implements CSS min-size semantics via measureFunc, so text
 * is never clipped even with fill-container + stretch).
 *
 * NOTE: Yoga's default flexShrink is 0 (unlike CSS where it's 1).
 * For fit-content nodes in a flex container, we must set flexShrink=1
 * so they can shrink when space is tight. Otherwise in headless environments
 * where fonts fail to load, CJK text might measure very wide and push
 * fill-container siblings to 0 width (causing Rust canvas arcTo crash).
 */
function applyFillContainer(yn: YogaNode, wKind: SizeKind, hKind: SizeKind, parentLayout: string | undefined) {
  const isParentRow = parentLayout === 'horizontal';
  if (isParentRow && wKind.kind === 'fill-container') {
    // Main axis = width in a horizontal row
    yn.setFlexGrow(1);
    yn.setFlexShrink(1);
    yn.setFlexBasis(0);
  } else if (!isParentRow && hKind.kind === 'fill-container') {
    // Main axis = height in a vertical column (or root)
    yn.setFlexGrow(1);
    yn.setFlexShrink(1);
    yn.setFlexBasis(0);
  } else if (isParentRow && wKind.kind === 'fit-content') {
    // fit-content nodes in a horizontal row: allow shrinking (CSS default is 1, Yoga default is 0).
    // Without this, oversized text (e.g. CJK without fonts) won't shrink at all, squeezing
    // fill-container siblings down to 0 width.
    yn.setFlexShrink(1);
  } else if (!isParentRow && hKind.kind === 'fit-content') {
    // fit-content nodes in a vertical column: allow shrinking on main axis.
    yn.setFlexShrink(1);
  }

  // Cross-axis fill-container: parent stretch normally covers this, BUT if the parent
  // uses alignItems: center (or start/end), the child won't stretch automatically.
  // We must explicitly set alignSelf: stretch to guarantee fill-container works on the
  // cross axis regardless of the parent's alignItems value.
  // - Vertical parent + width fill-container → cross axis is horizontal width
  // - Horizontal parent + height fill-container → cross axis is vertical height
  if (!isParentRow && wKind.kind === 'fill-container') {
    yn.setAlignSelf(Yoga.ALIGN_STRETCH);
  } else if (isParentRow && hKind.kind === 'fill-container') {
    yn.setAlignSelf(Yoga.ALIGN_STRETCH);
  }
}

// ─── Apply justifyContent ─────────────────────────────────────────────────────

function applyJustifyContent(yn: YogaNode, jc: string | undefined) {
  switch (jc) {
    case 'center':
      yn.setJustifyContent(Yoga.JUSTIFY_CENTER);
      break;
    case 'end':
      yn.setJustifyContent(Yoga.JUSTIFY_FLEX_END);
      break;
    case 'space-between':
      yn.setJustifyContent(Yoga.JUSTIFY_SPACE_BETWEEN);
      break;
    case 'space-around':
      yn.setJustifyContent(Yoga.JUSTIFY_SPACE_AROUND);
      break;
    default:
      yn.setJustifyContent(Yoga.JUSTIFY_FLEX_START);
      break;
  }
}

// ─── Apply alignItems ─────────────────────────────────────────────────────────

function applyAlignItems(yn: YogaNode, ai: string | undefined) {
  switch (ai) {
    case 'center':
      yn.setAlignItems(Yoga.ALIGN_CENTER);
      break;
    case 'end':
      yn.setAlignItems(Yoga.ALIGN_FLEX_END);
      break;
    case 'start':
      yn.setAlignItems(Yoga.ALIGN_FLEX_START);
      break;
    case 'stretch':
      yn.setAlignItems(Yoga.ALIGN_STRETCH);
      break;
    // By default, Yoga uses STRETCH. But for whiteboard shapes, stretching
    // without vertical centering causes text to stick to the top.
    // CSS flexbox defaults to stretch, but for diagram nodes start/center is safer.
    default:
      yn.setAlignItems(Yoga.ALIGN_FLEX_START);
      break;
  }
}

// ─── Get text content as string ───────────────────────────────────────────────

function textToString(text: string | Array<{ content: string }> | undefined): string | undefined {
  if (!text) return undefined;
  if (typeof text === 'string') return text;
  return text.map(r => r.content).join('');
}

// ─── Build Yoga tree from a DSL node ─────────────────────────────────────────

type LayoutContext = {
  // Deferred rendering of dagre connectors since we need full layout geometry first
  deferredEdges: Array<{
    frameNode: WBFrame;
    dagreGraph: dagre.graphlib.Graph;
    dagreEdgeTuples: Array<{ from: string; to: string; label?: string }>;
  }>;
};

/**
 * Recursively build a Yoga node tree for `node`.
 * `parentLayout` tells us whether parent is 'horizontal'/'vertical'/'none'
 * so we can set absolute position when needed.
 */
function buildYogaNode(node: WBNode, parentLayout: string | undefined, ctx: LayoutContext): YogaNode {
  const yn = Yoga.Node.create();

  // For frame nodes or leaf nodes with text content, undefined width/height
  // should mean "fit-content" (intrinsic sizing via Yoga or measureFunc),
  // matching CSS Flexbox standard behavior where `width: auto` = content-driven sizing.
  // Without this, parseSizeValue(all undefined) returns fixed 200×80, which
  // hardcodes node dimensions and causes stretching/misalignment.
  const isContainer = node.type === 'frame';
  const hasText = node.type !== 'connector' && !!(node as any).text;

  const isIcon = node.type === 'icon';
  const nodeW = (node as any).width ?? (isContainer || hasText ? 'fit-content' : undefined);
  const nodeH = (node as any).height ?? (isContainer || hasText ? 'fit-content' : undefined);

  const defaultW = isIcon ? DEFAULT_ICON_SIZE : DEFAULT_WIDTH;
  const defaultH = isIcon ? DEFAULT_ICON_SIZE : DEFAULT_HEIGHT;
  const wKind = applySize(yn, nodeW, defaultW, 'width');
  const hKind = applySize(yn, nodeH, defaultH, 'height');

  // fill-container → flex: 1 on main axis (direction-aware)
  applyFillContainer(yn, wKind, hKind, parentLayout);

  if (node.type === 'frame') {
    const frame = node as WBFrame;
    yn.setDisplay(Yoga.DISPLAY_FLEX);

    if (frame.layout === 'horizontal') {
      yn.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
    } else {
      // 'vertical' or undefined → column
      yn.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
    }

    applyJustifyContent(yn, frame.justifyContent);
    applyAlignItems(yn, frame.alignItems);
    // Note: alignItems defaults to STRETCH in Yoga — equal-height children for free!

    if (frame.gap) {
      yn.setGap(Yoga.GUTTER_ALL, frame.gap);
    }

    // Standard behavior: padding and gap are independent.
    const pad = parsePadding(frame.padding as PaddingValue);
    const padTop = pad.top || 0;
    const padRight = pad.right || 0;
    const padBottom = pad.bottom || 0;
    const padLeft = pad.left || 0;

    if (padTop) yn.setPadding(Yoga.EDGE_TOP, padTop);
    if (padRight) yn.setPadding(Yoga.EDGE_RIGHT, padRight);
    if (padBottom) yn.setPadding(Yoga.EDGE_BOTTOM, padBottom);
    if (padLeft) yn.setPadding(Yoga.EDGE_LEFT, padLeft);

    const children = (frame.children ?? []) as WBNode[];
    const childYnList: YogaNode[] = [];

    if (frame.layout === 'dagre') {
      const g = new dagre.graphlib.Graph({ compound: true });
      g.setGraph({
        rankdir: (frame.layoutOptions?.rankdir as any) ?? 'TB',
        align: frame.layoutOptions?.align,
        nodesep: frame.layoutOptions?.nodesep ?? 50,
        edgesep: frame.layoutOptions?.edgesep ?? 50,
        ranksep: frame.layoutOptions?.ranksep ?? 50,
      });
      g.setDefaultEdgeLabel(() => ({}));

      const descendantToAncestorMap = new Map<string, string>();
      function mapDescendantsToRoot(curr: WBNode, rootId: string) {
        if ((curr as any).children) {
          for (const c of (curr as any).children) {
            if (c.id) descendantToAncestorMap.set(c.id, rootId);
            mapDescendantsToRoot(c as WBNode, rootId);
          }
        }
      }

      function buildDagreSubtree(node: WBNode, parentId?: string): YogaNode {
        if (node.type === 'frame' && node.layout === 'dagre' && node.layoutOptions?.isCluster) {
          const childYn = Yoga.Node.create();
          if (node.id) {
            g.setNode(node.id, { label: '' });
            if (parentId) g.setParent(node.id, parentId);
          }
          childYn.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE);
          childYn.setDisplay(Yoga.DISPLAY_FLEX);
          const kids = node.children || [];
          for (let i = 0; i < kids.length; i++) {
            childYn.insertChild(buildDagreSubtree(kids[i], node.id), i);
          }
          return childYn;
        } else {
          const opaqueYn = buildYogaNode(node, 'none', ctx);
          opaqueYn.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE);
          opaqueYn.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);
          const computedW = opaqueYn.getComputedWidth() > 0 ? opaqueYn.getComputedWidth() : ((node as any).width ?? 200);
          const computedH = opaqueYn.getComputedHeight() > 0 ? opaqueYn.getComputedHeight() : ((node as any).height ?? 80);
          if (node.id) {
            g.setNode(node.id, { width: computedW, height: computedH });
            if (parentId) g.setParent(node.id, parentId);
            mapDescendantsToRoot(node, node.id);
          }
          opaqueYn.setWidth(computedW);
          opaqueYn.setHeight(computedH);
          return opaqueYn;
        }
      }

      for (let i = 0; i < children.length; i++) {
        yn.insertChild(buildDagreSubtree(children[i], undefined), i);
      }

      const rawEdges = frame.layoutOptions?.edges ?? [];
      const dagreEdgeTuples: Array<{ from: string; to: string; label?: string }> = [];
      for (const e of rawEdges) {
        let from = e[0];
        let to = e[1];
        const label = e[2];
        if (from && descendantToAncestorMap.has(from)) from = descendantToAncestorMap.get(from)!;
        if (to && descendantToAncestorMap.has(to)) to = descendantToAncestorMap.get(to)!;
        if (from && to) {
          if (g.hasNode(from) && g.hasNode(to)) {
            g.setEdge(from, to);
            dagreEdgeTuples.push({ from, to, label });
          } else {
            console.warn(`[Dagre Layout] Ignored dangling edge: ${from} -> ${to}`);
          }
        }
      }

      dagre.layout(g);

      const dWidth = g.graph().width || 0;
      const dHeight = g.graph().height || 0;
      if (wKind.kind === 'fit-content') {
        yn.setWidth(dWidth + padLeft + padRight);
      }
      if (hKind.kind === 'fit-content') {
        yn.setHeight(dHeight + padTop + padBottom);
      }

      function applyDagreCoords(node: WBNode, yNode: YogaNode, parentDagreX: number, parentDagreY: number, isTopLevel: boolean) {
        if (node.id && g.hasNode(node.id)) {
          const dgNode = g.node(node.id);
          const isClusterNode = node.type === 'frame' && node.layout === 'dagre' && node.layoutOptions?.isCluster;

          let cx = dgNode.x - dgNode.width / 2;
          let cy = dgNode.y - dgNode.height / 2;
          let width = dgNode.width;
          let height = dgNode.height;

          const offsetL = isTopLevel ? padLeft : 0;
          const offsetT = isTopLevel ? padTop : 0;

          const posL = cx - parentDagreX + offsetL;
          const posT = cy - parentDagreY + offsetT;
          yNode.setPosition(Yoga.EDGE_LEFT, posL);
          yNode.setPosition(Yoga.EDGE_TOP, posT);

          if (isClusterNode) {
            yNode.setWidth(width);
            yNode.setHeight(height);
            const kids = (node as any).children || [];
            for (let i = 0; i < kids.length; i++) {
              applyDagreCoords(kids[i], yNode.getChild(i), cx, cy, false);
            }
          }
        }
      }

      for (let i = 0; i < children.length; i++) {
        applyDagreCoords(children[i], yn.getChild(i), 0, 0, true);
      }

      ctx.deferredEdges.push({ frameNode: frame, dagreGraph: g, dagreEdgeTuples });
    } else {
      for (let i = 0; i < children.length; i++) {
        const childNode = children[i];
        const childYn = buildYogaNode(childNode, frame.layout ?? 'none', ctx);

        // If parent uses absolute layout, position each child explicitly
        if (!frame.layout || frame.layout === 'none') {
          childYn.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE);
          const cx = (children[i] as any).x ?? 0;
          const cy = (children[i] as any).y ?? 0;
          childYn.setPosition(Yoga.EDGE_LEFT, cx);
          childYn.setPosition(Yoga.EDGE_TOP, cy);
        }

        yn.insertChild(childYn, i);
      }
    }
  } else if (node.type !== 'connector') {
    // Leaf node: rect, ellipse, diamond, triangle, cylinder, text, stickyNote, svg, image
    const textStr = textToString((node as any).text);
    if (textStr) {
      const fontSize = (node as any).fontSize ?? DEFAULT_FONT_SIZE;
      const bold = (node as any).fontWeight === 'bold';

      const richProps = normalizeText((node as any).text)?.richProps;
      const baseOpts = { text: textStr, fontSize, bold, nodeType: node.type, richProps };

      yn.setMeasureFunc((width: number, widthMode: number) => {
        if (widthMode === Yoga.MEASURE_MODE_UNDEFINED) {
          const r = measureText(baseOpts);
          return { width: r.width, height: r.height };
        } else if (widthMode === Yoga.MEASURE_MODE_AT_MOST) {
          const natural = measureText(baseOpts);
          if (natural.width <= width) {
            return { width: natural.width, height: natural.height };
          }
          const r = measureText({ ...baseOpts, containerWidth: Math.max(1, Math.ceil(width) + 0.5) });
          return { width: Math.min(r.width, width), height: r.height };
        } else {
          const r = measureText({ ...baseOpts, containerWidth: Math.max(1, Math.ceil(width) + 0.5) });
          return { width: r.width, height: r.height };
        }
      });
    }
  }

  return yn;
}

// ─── Extract layout results back to ResolvedNode tree ─────────────────────────

function extractResolved(yn: YogaNode, node: WBNode, parentAbsX: number, parentAbsY: number): ResolvedNode {
  const absX = parentAbsX + yn.getComputedLeft();
  const absY = parentAbsY + yn.getComputedTop();
  const width = yn.getComputedWidth();
  const height = yn.getComputedHeight();

  if (isNaN(width) || isNaN(height) || isNaN(absX) || isNaN(absY)) {
    console.warn('NaN geometry detected:', { type: node.type, id: node.id, width, height });
  }

  const children: ResolvedNode[] = [];
  if (node.type === 'frame' && (node as WBFrame).children) {
    const kids = (node as WBFrame).children as WBNode[];
    for (let i = 0; i < kids.length; i++) {
      children.push(extractResolved(yn.getChild(i), kids[i], absX, absY));
    }
  }

  return { node, absX, absY, width, height, children };
}

// ─── Step 2 — Main resolveLayout entry ───────────────────────────────────────

export function resolveLayout(doc: WBDocument): ResolvedNode[] {
  const ctx: LayoutContext = { deferredEdges: [] };
  const clean = liftConnectors(doc);
  const resolved: ResolvedNode[] = [];

  for (const node of clean.nodes) {
    if (node.type === 'connector') {
      // Connectors have no layout — emit with zero geometry for compiler to handle
      resolved.push({ node, absX: 0, absY: 0, width: 0, height: 0, children: [] });
      continue;
    }

    // Build Yoga tree for this top-level node
    const yn = buildYogaNode(node, undefined, ctx);

    // top-level nodes use their explicit x/y as offset
    const rootX = (node as any).x ?? 0;
    const rootY = (node as any).y ?? 0;

    // Run Yoga layout
    yn.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);

    // Extract absolute coordinates
    const r = extractResolved(yn, node, rootX, rootY);

    // Free Yoga memory
    yn.freeRecursive();

    resolved.push(r);
  }


  const flat = flattenResolved(resolved);

  // -- Post-process: inject cluster titles bypassing Yoga --
  for (const rNode of flat) {
    const node = rNode.node;
    if (node.type === 'frame' && node.layout === 'dagre' && node.layoutOptions?.isCluster) {
      const titleText = node.layoutOptions.clusterTitle;
      if (titleText && node.id) {
        const virtId = `virt_title_${node.id}`;
        if (!node.children) node.children = [];
        if (!node.children.some((c: any) => c.id === virtId)) {
          const titleNode: WBTextNode = {
            type: 'text',
            id: virtId,
            text: [{ content: titleText, bold: true }],
            fontSize: 14,
            textColor: node.layoutOptions.clusterTitleColor || '#1F2329',
          };
          node.children.push(titleNode);

          const size = measureText({ text: titleText, fontSize: 14, bold: true });
          rNode.children.push({
            node: titleNode,
            absX: rNode.absX + 16,
            absY: rNode.absY + 16,
            width: size.width,
            height: size.height,
            children: []
          });
        }
      }
    }
  }

  for (const { frameNode, dagreGraph, dagreEdgeTuples } of ctx.deferredEdges) {
    const rNode = flat.find((r: any) => r.node === frameNode);
    if (!rNode) continue;

    const frameAbsX = rNode.absX;
    const frameAbsY = rNode.absY;
    const pad = parsePadding((frameNode as any).padding);
    const padLeft = pad.left || 0;
    const padTop = pad.top || 0;

    dagreGraph.edges().forEach((e: any) => {
      const dgEdge = dagreGraph.edge(e);
      if (!dgEdge || !dgEdge.points) return;

      const tuple = dagreEdgeTuples.find((t: any) => t.from === e.v && t.to === e.w);
      if (tuple) {
        const startPt = dgEdge.points[0];
        const endPt = dgEdge.points[dgEdge.points.length - 1];

        const vNode = dagreGraph.node(e.v);
        const wNode = dagreGraph.node(e.w);

        const getAnchor = (dx: number, dy: number): 'top' | 'right' | 'bottom' | 'left' => {
          return Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? 'right' : 'left')
            : (dy > 0 ? 'bottom' : 'top');
        };

        const fromAnchor = getAnchor(startPt.x - vNode.x, startPt.y - vNode.y);
        const toAnchor = getAnchor(endPt.x - wNode.x, endPt.y - wNode.y);

        const waypoints = dgEdge.points.map((p: any) => ({
          x: frameAbsX + p.x + padLeft,
          y: frameAbsY + p.y + padTop,
        }));

        const synthesized: any = {
          type: 'connector',
          id: `dagre-edge-${frameNode.id ?? 'f'}-${tuple.from}-${tuple.to}`,
          connector: {
            from: tuple.from,
            to: tuple.to,
            fromAnchor,
            toAnchor,
            label: tuple.label,
            lineShape: 'curve',
            endArrow: 'arrow',
            lineColor: '#A3A3A3',
            lineWidth: 2,
            waypoints,
          },
        };

        resolved.push({ node: synthesized, absX: 0, absY: 0, width: 0, height: 0, children: [] });
      }
    });
  }

  return resolved;
}
