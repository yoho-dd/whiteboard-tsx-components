/**
 * Custom JSX Runtime for Whiteboard Component Library
 *
 * Lightweight, zero-dependency JSX runtime that converts JSX → WBDocument JSON.
 * No React/DOM dependency. Components are pure functions: props → DSL JSON objects.
 *
 * Usage: Add `@jsxImportSource @larksuite/whiteboard-cli/components` pragma
 * or configure tsconfig.json with jsxImportSource.
 */

// ─── Children Normalization ─────────────────────────────────────────────────

/**
 * Flatten and filter children into a clean array.
 * - Single child → wrapped in array
 * - Nested arrays → recursively flattened
 * - null/undefined/false/true → filtered out
 */
export function normalizeChildren(children: unknown): unknown[] {
  if (children == null || children === false || children === true) return [];
  if (!Array.isArray(children)) return [children];
  const result: unknown[] = [];
  for (const child of children) {
    if (child == null || child === false || child === true) continue;
    if (Array.isArray(child)) {
      result.push(...normalizeChildren(child));
    } else {
      result.push(child);
    }
  }
  return result;
}

// ─── JSX Factory ────────────────────────────────────────────────────────────

type ComponentFn = (props: Record<string, unknown>) => unknown;

/**
 * JSX element factory. Called by the TypeScript compiler for JSX expressions.
 *
 * - If `tag` is a function (component), calls it with props and returns the result.
 * - String tags (HTML elements) are not supported and will throw.
 */
export function jsx(tag: ComponentFn | string, props: Record<string, unknown>): unknown {
  if (typeof tag === 'string') {
    throw new Error(
      `Whiteboard JSX does not support HTML tags like <${tag}>. ` +
      `Use component functions (e.g., <Rect>, <HStack>) instead.`
    );
  }
  return tag(props);
}

/** Same as jsx — React 17+ calls jsxs for elements with multiple children. */
export const jsxs = jsx;

/** Fragment: returns children as a flat array (no wrapper node). */
export function Fragment(props: { children?: unknown }): unknown[] {
  return normalizeChildren(props.children);
}

// Re-export for jsxDEV (development mode)
export const jsxDEV = jsx;
