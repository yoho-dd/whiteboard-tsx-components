/**
 * auto-layout-dsl — Public API
 *
 * Usage:
 *   import { compileDocument } from './auto-layout-dsl/index';
 *   import { HeadlessWhiteboard } from './headless/engine';
 *
 *   const payloads = compileDocument(myWBDocument);
 *   whiteboard.insertNodes(payloads);
 */

export { WBDocumentSchema, WBNodeSchema, WBChildSchema, WBSizeSchema } from './schema';
export type {
  WBDocument,
  WBNode,
  WBChild,
  WBFrame,
  WBRect,
  WBEllipse,
  WBDiamond,
  WBTriangle,
  WBCylinder,
  WBTrapezoid,
  WBTextNode,
  WBStickyNote,
  WBConnectorNode,
  WBSvgNode,
  WBImageNode,
  WBConnector,
  WBTextRun,
  WBSizeValue,
} from './types';

export { resolveLayout, flattenResolved } from './layout-yoga';
export type { ResolvedNode } from './layout-yoga';

import { WBDocumentSchema } from './schema';
import { resolveLayout, flattenResolved } from './layout-yoga';
import { compileToPageNodes } from '../page-detail/compile';
import { resolveRouting } from '../routing';
import type { WBDocument } from './types';
import type { z } from 'zod';

function formatZodError(error: z.ZodError): string {
  const messages: string[] = [];

  for (const e of error.errors) {
    if (e.code === 'invalid_union' && e.unionErrors) {
      let foundDeepError = false;
      for (const ue of e.unionErrors) {
        for (const issue of ue.issues) {
          // If the issue is a missing nested property (invalid_type) or custom error, it's very relevant
          if (issue.code === 'custom' || issue.code === 'invalid_type') {
            const fullPath = [...e.path, ...issue.path].filter(Boolean).join('.');
            const msg =
              issue.code === 'invalid_type' && issue.message === 'Required'
                ? 'Required property missing'
                : issue.message;
            messages.push(`  [${fullPath || 'root'}] ${msg}`);
            foundDeepError = true;
          }
        }
      }
      if (!foundDeepError) {
        messages.push(`  [${e.path.join('.') || 'root'}] Invalid object structure or missing 'type'`);
      }
    } else {
      messages.push(`  [${e.path.join('.') || 'root'}] ${e.message}`);
    }
  }

  // Deduplicate and return
  return Array.from(new Set(messages)).join('\n');
}

/**
 * Validate a WBDocument without compiling.
 * Returns { ok: true } or { ok: false, errors: string[] }.
 */
export function validateDocument(raw: unknown): { ok: true; document: WBDocument } | { ok: false; errors: string[] } {
  const result = WBDocumentSchema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      errors: formatZodError(result.error)
        .split('\n')
        .map(l => l.trim()),
    };
  }
  return { ok: true, document: result.data };
}

// ─── Compile API ─────────────────────────────────────────────────────────────

/**
 * Validate + layout + compile a raw WBDocument into engine-ready PageNode[].
 *
 * Convenience wrapper: validateDocument → resolveLayout → compileToPageNodes.
 * Throws on validation failure.
 */
export function compileDocument(raw: unknown): unknown[] {
  const valResult = validateDocument(raw);
  if (!valResult.ok) {
    throw new Error(`Invalid WBDocument:\n${valResult.errors.join('\n')}`);
  }
  let resolved = resolveLayout(valResult.document);
  resolved = resolveRouting(valResult.document, resolved);

  return compileToPageNodes(resolved);
}

// ─── Layout Info API ─────────────────────────────────────────────────────────

/** Absolute bounding box of a node after layout computation. */
export interface LayoutRect {
  /** DSL-level node id */
  id: string;
  /** Absolute x on canvas */
  absX: number;
  /** Absolute y on canvas */
  absY: number;
  /** Computed width */
  width: number;
  /** Computed height */
  height: number;
}

/**
 * Run layout on a WBDocument and return a Map of DSL node.id → LayoutRect.
 *
 * Only nodes with an explicit `id` field are included.
 *
 * Use this to query exact absolute positions after auto-layout,
 * then add annotation connectors with precise {x,y} coordinates.
 *
 * @example
 * ```ts
 * const doc: WBDocument = { version: 2, nodes: [
 *   { type: 'rect', id: 'a', ... },
 *   { type: 'rect', id: 'b', ... },
 * ]};
 * const layout = getLayoutInfo(doc);
 * const a = layout.get('a')!;
 * // a.absX, a.absY, a.width, a.height
 * ```
 */
export function getLayoutInfo(doc: WBDocument): Map<string, LayoutRect> {
  const resolved = resolveLayout(doc);
  const flat = flattenResolved(resolved);
  const map = new Map<string, LayoutRect>();

  for (const r of flat) {
    const id = r.node.id;
    if (!id) continue;
    map.set(id, {
      id,
      absX: Math.round(r.absX),
      absY: Math.round(r.absY),
      width: Math.round(r.width),
      height: Math.round(r.height),
    });
  }

  return map;
}
