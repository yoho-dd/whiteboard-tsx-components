/**
 * Zod validation schemas for Auto Layout DSL v2.
 *
 * These schemas validate untrusted AI output before layout/compilation.
 * The ground-truth type definitions live in ./types.ts.
 */

import { z } from 'zod';
import { STICKY_NOTE_FILL_COLORS } from './types';
import type {
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
  WBIconNode,
  WBChild,
  WBNode,
  WBDocument,
  WBShapeType,
} from './types';

// ─── Primitive schemas ───────────────────────────────────────────────────────

export const WBSizeSchema = z
  .union([
    z.number().positive('Size must be a positive number'),
    z
      .string()
      .regex(
        /^(fit-content|fill-container)(\(\d+(\.\d+)?\))?$/,
        "Must be a positive number, 'fit-content', 'fit-content(N)', 'fill-container', or 'fill-container(N)'",
      ),
  ])
  .describe(
    "Width/height in pixels (border-box). Use 'fit-content' to auto-size from text or children, " +
    "'fill-container' to fill parent Flex space. Add (N) as fallback, e.g. 'fill-container(200)'.",
  );

// ─── Sub-structure schemas ───────────────────────────────────────────────────

const WBTextRunSchema = z.object({
  content: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  strikeThrough: z.boolean().optional(),
  fontSize: z.number().positive().optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  hyperlink: z.string().optional(),
  listType: z.enum(['none', 'ordered', 'unordered']).optional(),
  indent: z.number().int().min(0).optional(),
  quote: z.boolean().optional(),
});

const WBConnectorSchema = z.object({
  from: z.union([
    z.string().describe('id of the source node'),
    z.object({ x: z.number(), y: z.number() }).describe('absolute canvas coordinate'),
  ]),
  to: z.union([
    z.string().describe('id of the target node'),
    z.object({ x: z.number(), y: z.number() }).describe('absolute canvas coordinate'),
  ]),
  fromAnchor: z.enum(['top', 'right', 'bottom', 'left']).optional(),
  toAnchor: z.enum(['top', 'right', 'bottom', 'left']).optional(),
  lineShape: z.enum(['straight', 'curve', 'rightAngle', 'polyline']).optional(),
  lineColor: z.string().optional(),
  lineWidth: z.number().positive().optional(),
  lineStyle: z.enum(['solid', 'dashed', 'dotted']).optional(),
  startArrow: z.enum(['none', 'arrow', 'triangle', 'circle', 'diamond']).optional(),
  endArrow: z.enum(['none', 'arrow', 'triangle', 'circle', 'diamond']).optional(),
  waypoints: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  label: z.string().optional(),
  labelPosition: z.number().min(0).max(1).optional(),
});

// ─── Field groups (mixed into object schemas via spread) ─────────────────────

const entityFields = {
  id: z.string().describe('Globally unique id.').optional(),
  x: z.number().describe('Canvas X. Ignored in Flex layout.').optional(),
  y: z.number().describe('Canvas Y. Ignored in Flex layout.').optional(),
};

const opacityField = {
  opacity: z.number().min(0).max(1).optional(),
  vFlip: z.boolean().optional(),
  hFlip: z.boolean().optional(),
  lock: z.boolean().optional(),
  angle: z.number().optional(),
};

const sizeFields = {
  width: WBSizeSchema.optional(),
  height: WBSizeSchema.optional(),
};

const graphicsFields = {
  fillColor: z.string().describe("Fill color, e.g. '#3B82F6' or 'transparent'.").optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().nonnegative().optional(),
  borderDash: z.enum(['solid', 'dashed', 'dotted']).optional(),
  borderRadius: z.number().nonnegative().optional(),
};

const textFields = {
  text: z
    .union([z.string(), z.array(WBTextRunSchema)])
    .describe("Text label. String or WBTextRun[] for rich text. Use height:'fit-content' to auto-expand.")
    .optional(),
  fontSize: z.number().positive().optional(),
  textColor: z.string().optional(),
  fontWeight: z.enum(['bold']).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
};

export const WBDagreLayoutOptionsSchema = z.object({
  rankdir: z.enum(['TB', 'BT', 'LR', 'RL']).optional(),
  align: z.enum(['UL', 'UR', 'DL', 'DR']).optional(),
  nodesep: z.number().nonnegative().optional(),
  edgesep: z.number().nonnegative().optional(),
  ranksep: z.number().nonnegative().optional(),
  edges: z
    .array(
      z.union([
        z.tuple([z.string(), z.string()]),
        z.tuple([z.string(), z.string(), z.string()]),
      ])
    )
    .describe('Topological edges: [sourceId, targetId, optionalLabel]. Engine auto-synthesizes connectors.')
    .optional(),
  isCluster: z.boolean().optional(),
  clusterTitle: z.string().describe('Title text for the cluster').optional(),
  clusterTitleColor: z.string().describe('Color of the cluster title text').optional(),
});

const layoutFields = {
  layout: z.enum(['horizontal', 'vertical', 'none', 'dagre']).describe('Flex layout direction.').optional(),
  gap: z.number().nonnegative().describe('Gap between children on the main axis.').optional(),
  padding: z
    .union([
      z.number().nonnegative(),
      z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
      z.tuple([z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative()]),
    ])
    .describe('Inner padding.')
    .optional(),
  justifyContent: z.enum(['start', 'center', 'end', 'space-between', 'space-around']).optional(),
  alignItems: z.enum(['start', 'center', 'end', 'stretch']).optional(),
  layoutOptions: WBDagreLayoutOptionsSchema.optional(),
};

// ─── Node schemas ────────────────────────────────────────────────────────────

function shapeSchema<T extends WBShapeType>(typeName: T) {
  return z.object({
    type: z.literal(typeName),
    ...entityFields,
    ...opacityField,
    ...sizeFields,
    ...graphicsFields,
    ...textFields,
  });
}

const WBRectSchema = shapeSchema('rect');
const WBEllipseSchema = shapeSchema('ellipse');
const WBDiamondSchema = shapeSchema('diamond');
const WBTriangleSchema = shapeSchema('triangle').extend({
  topWidth: z.number().optional(),
});
const WBCylinderSchema = shapeSchema('cylinder');
const WBTrapezoidSchema = shapeSchema('trapezoid').extend({
  topWidth: z.number().optional(),
});

const WBTextNodeSchema = z.object({ type: z.literal('text'), ...entityFields, ...sizeFields, ...textFields });

const StickyNoteFillColorSchema = z.enum(STICKY_NOTE_FILL_COLORS);

const WBStickyNoteSchema = z.object({
  type: z.literal('stickyNote'),
  ...entityFields,
  ...sizeFields,
  ...textFields,
  fillColor: StickyNoteFillColorSchema.optional(),
});
const WBConnectorNodeSchema = z.object({ type: z.literal('connector'), ...entityFields, connector: WBConnectorSchema });
const WBSvgNodeSchema = z.object({
  type: z.literal('svg'),
  ...entityFields,
  ...opacityField,
  ...sizeFields,
  svg: z.object({
    code: z.string().superRefine((val, ctx) => {
      const forbiddenTags = ['<text', '<tspan', '<image', '<foreignObject'];
      for (const tag of forbiddenTags) {
        if (val.includes(tag)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${tag}> is not allowed in SVG. Use sibling DSL nodes instead.`,
          });
        }
      }
      if (/(href|xlink:href)\s*=\s*["']?([^#"' >]+)/i.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'External resources are not allowed in SVG. Only internal fragments (e.g., href="#id") are permitted.',
        });
      }
    }),
  }),
});
const WBImageNodeSchema = z.object({
  type: z.literal('image'),
  ...entityFields,
  ...opacityField,
  ...sizeFields,
  image: z.object({ src: z.string() }),
});
const WBIconNodeSchema = z.object({
  type: z.literal('icon'),
  ...entityFields,
  ...opacityField,
  ...sizeFields,
  name: z.string(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// Recursive frame schema
export const WBFrameSchema: z.ZodType<WBFrame> = z.lazy(() =>
  z.object({
    type: z.literal('frame'),
    ...entityFields,
    ...sizeFields,
    ...graphicsFields,
    ...layoutFields,
    children: z.array(WBChildSchema).optional(),
  }),
);

// ─── Discriminator check ─────────────────────────────────────────────────────

const checkNodeDiscriminator = (val: unknown, expectedTypes: readonly string[], ctx: z.RefinementCtx) => {
  if (!val || typeof val !== 'object') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Expected an object' });
    return false;
  }
  const typeStr = (val as Record<string, unknown>).type;
  if (!typeStr) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Missing "type" property' });
    return false;
  }
  if (!expectedTypes.includes(typeStr as string)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Unknown "type": "${typeStr}". Expected one of: ${expectedTypes.join(', ')}`,
    });
    return false;
  }
  return true;
};

const ALL_CHILD_TYPES = [
  'frame',
  'rect',
  'ellipse',
  'diamond',
  'triangle',
  'cylinder',
  'trapezoid',
  'text',
  'stickyNote',
  'svg',
  'image',
  'icon',
] as const;
const ALL_NODE_TYPES = [...ALL_CHILD_TYPES, 'connector'] as const;

// ─── Union schemas ───────────────────────────────────────────────────────────

/** All node types except connector — valid inside frame.children. */
export const WBChildSchema: z.ZodType<WBChild> = z.lazy(() =>
  z
    .union([
      WBFrameSchema,
      WBRectSchema,
      WBEllipseSchema,
      WBDiamondSchema,
      WBTriangleSchema,
      WBCylinderSchema,
      WBTrapezoidSchema,
      WBTextNodeSchema,
      WBStickyNoteSchema,
      WBSvgNodeSchema,
      WBImageNodeSchema,
      WBIconNodeSchema,
    ])
    .superRefine((val, ctx) => {
      checkNodeDiscriminator(val, ALL_CHILD_TYPES, ctx);
    }),
) as z.ZodType<WBChild>;

/** All node types including connector. */
export const WBNodeSchema: z.ZodType<WBNode> = z.lazy(() =>
  z
    .union([
      WBFrameSchema,
      WBRectSchema,
      WBEllipseSchema,
      WBDiamondSchema,
      WBTriangleSchema,
      WBCylinderSchema,
      WBTrapezoidSchema,
      WBTextNodeSchema,
      WBStickyNoteSchema,
      WBConnectorNodeSchema,
      WBSvgNodeSchema,
      WBImageNodeSchema,
      WBIconNodeSchema,
    ])
    .superRefine((val, ctx) => {
      checkNodeDiscriminator(val, ALL_NODE_TYPES, ctx);
    }),
) as z.ZodType<WBNode>;

// ─── Document schema ─────────────────────────────────────────────────────────

export const WBDocumentSchema: z.ZodType<WBDocument> = z
  .object({
    version: z.literal(2),
    nodes: z.array(WBNodeSchema).describe('Top-level canvas nodes. Connectors MUST be here, not in frame.children.'),
  })
  .superRefine((doc, ctx) => {
    const seen = new Set<string>();
    function checkIds(nodes: WBNode[]): void {
      for (const node of nodes) {
        if (node.id) {
          if (seen.has(node.id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Duplicate node id "${node.id}" — all ids must be globally unique.`,
              path: ['nodes'],
            });
          }
          seen.add(node.id);
        }
        if (node.type === 'frame' && node.children) {
          checkIds(node.children as WBNode[]);
        }
      }
    }
    checkIds(doc.nodes);
  }) as z.ZodType<WBDocument>;

// ─── Compile-time sync check ─────────────────────────────────────────────────
// If types.ts and schema.ts drift apart, tsc will error on these lines.
// Each assertion verifies that the schema's inferred output is assignable to
// the hand-written interface, and vice versa.

type AssertExtends<T, U> = T extends U ? true : never;
type SchemaOutput<S> = S extends z.ZodType<infer O> ? O : never;

// Leaf nodes
type _CheckRect = AssertExtends<SchemaOutput<typeof WBRectSchema>, WBRect>;
type _CheckEllipse = AssertExtends<SchemaOutput<typeof WBEllipseSchema>, WBEllipse>;
type _CheckDiamond = AssertExtends<SchemaOutput<typeof WBDiamondSchema>, WBDiamond>;
type _CheckTriangle = AssertExtends<SchemaOutput<typeof WBTriangleSchema>, WBTriangle>;
type _CheckCylinder = AssertExtends<SchemaOutput<typeof WBCylinderSchema>, WBCylinder>;
type _CheckTrapezoid = AssertExtends<SchemaOutput<typeof WBTrapezoidSchema>, WBTrapezoid>;
type _CheckText = AssertExtends<SchemaOutput<typeof WBTextNodeSchema>, WBTextNode>;
type _CheckSticky = AssertExtends<SchemaOutput<typeof WBStickyNoteSchema>, WBStickyNote>;
type _CheckConnector = AssertExtends<SchemaOutput<typeof WBConnectorNodeSchema>, WBConnectorNode>;
type _CheckSvg = AssertExtends<SchemaOutput<typeof WBSvgNodeSchema>, WBSvgNode>;
type _CheckImage = AssertExtends<SchemaOutput<typeof WBImageNodeSchema>, WBImageNode>;
type _CheckIcon = AssertExtends<SchemaOutput<typeof WBIconNodeSchema>, WBIconNode>;
// Composite
type _CheckFrame = AssertExtends<SchemaOutput<typeof WBFrameSchema>, WBFrame>;
type _CheckChild = AssertExtends<SchemaOutput<typeof WBChildSchema>, WBChild>;
type _CheckNode = AssertExtends<SchemaOutput<typeof WBNodeSchema>, WBNode>;
type _CheckDoc = AssertExtends<SchemaOutput<typeof WBDocumentSchema>, WBDocument>;
