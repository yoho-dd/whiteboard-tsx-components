/**
 * Composite Components — Reusable UI patterns built on primitives
 *
 * These components encapsulate common whiteboard patterns (cards, sections, badges)
 * and automatically apply Design Tokens from the current theme.
 */

import { normalizeChildren } from './jsx-runtime.js';
import { parseMarkdownText } from './markdown-text.js';
import {
  getTheme,
  resolveColorGroup,
  setColorGroup,
  getColorGroup,
  spacing,
  borders,
  typography,
  iconSize,
  connectorDefaults,
  type ColorGroupName,
  type ConnectorVariant,
} from './theme.js';
import type {
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
  ComponentChildren,
} from './types.js';
import type { WBNode, WBChild } from './auto-layout-dsl/types.js';

// ─── Internal Helpers ───────────────────────────────────────────────────────

function truncateText(text: string | undefined, max: number): string | undefined {
  if (!text) return text;
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function flattenChildren(children: unknown): WBChild[] {
  const normalized = normalizeChildren(children);
  return normalized.filter((c): c is WBChild => c != null && typeof c === 'object') as WBChild[];
}

function clean<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v;
  }
  return result as T;
}

function processText(text: string | undefined): string | unknown[] | undefined {
  if (text == null) return undefined;
  return parseMarkdownText(text);
}

// ─── Card ───────────────────────────────────────────────────────────────────

/**
 * Standard card with title + optional subtitle.
 * Auto-applies colorGroup colors from theme if specified (or inherited from parent Section).
 *
 * ```tsx
 * <Card id="api" title="**API Gateway**" subtitle="REST/GraphQL" colorGroup="blue" />
 * ```
 */
export function Card(props: CardProps): WBNode {
  const {
    id,
    title,
    subtitle,
    colorGroup,
    width = 'fill-container',
    maxWidth = 360,
    height = 'fit-content',
    fillColor,
    borderColor,
    borderWidth,
    borderRadius,
    children,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);

  const cardChildren: WBChild[] = [];

  // Title text
  cardChildren.push(clean({
    type: 'text',
    width: 'fill-container' as any,
    height: 'fit-content' as any,
    text: processText(title),
    fontSize: typography.h3.fontSize,
    textColor: colors?.text ?? theme.text.primary,
  }) as WBChild);

  // Subtitle text (if provided)
  if (subtitle) {
    cardChildren.push(clean({
      type: 'text',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      text: processText(truncateText(subtitle, 60)),
      fontSize: typography.sub.fontSize,
      textColor: theme.text.secondary,
    }) as WBChild);
  }

  // Additional children (e.g., Badge)
  if (children) {
    cardChildren.push(...flattenChildren(children));
  }

  return clean({
    type: 'frame',
    id,
    layout: 'vertical',
    width,
    height,
    padding: [spacing.md, spacing.lg] as [number, number],
    gap: spacing.sm,
    fillColor: fillColor ?? colors?.fill ?? theme.canvas,
    borderColor: borderColor ?? colors?.softBorder ?? theme.connector.color,
    borderWidth: borderWidth ?? borders.card.width,
    borderRadius: borderRadius ?? borders.card.radius,
    children: cardChildren,
  }) as WBNode;
}

// ─── IconCard ───────────────────────────────────────────────────────────────

/**
 * Icon + title + subtitle card. Two layouts:
 * - direction='horizontal' (default): icon left, text right (Model A)
 * - direction='vertical': icon top, text below (Model B)
 *
 * ```tsx
 * <IconCard id="auth" icon="shield" title="Auth" subtitle="OAuth 2.0"
 *           direction="horizontal" colorGroup="green" />
 * ```
 */
export function IconCard(props: IconCardProps): WBNode {
  const {
    id,
    icon,
    iconColor,
    title,
    subtitle,
    direction = 'horizontal',
    colorGroup,
    width = 'fill-container',
    maxWidth = 360,
    height = 'fit-content',
    fillColor,
    borderColor,
    borderWidth,
    borderRadius,
    children,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);
  const resolvedIconColor = iconColor ?? colors?.border ?? theme.text.primary;

  // Icon node
  const iconNode = clean({
    type: 'icon',
    name: icon,
    color: resolvedIconColor,
    width: iconSize.lg,
    height: iconSize.lg,
  }) as WBChild;

  // Text container (title + subtitle)
  const textChildren: WBChild[] = [
    clean({
      type: 'text',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      text: processText(title),
      fontSize: typography.h3.fontSize,
      textColor: colors?.text ?? theme.text.primary,
    }) as WBChild,
  ];

  if (subtitle) {
    textChildren.push(clean({
      type: 'text',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      text: processText(truncateText(subtitle, 60)),
      fontSize: typography.sub.fontSize,
      textColor: theme.text.secondary,
    }) as WBChild);
  }

  if (children) {
    textChildren.push(...flattenChildren(children));
  }

  const textContainer = clean({
    type: 'frame',
    layout: 'vertical',
    width: 'fill-container' as any,
    height: 'fit-content' as any,
    gap: 2,
    children: textChildren,
  }) as WBChild;

  // Compose based on direction
  const isHorizontal = direction === 'horizontal';

  return clean({
    type: 'frame',
    id,
    layout: isHorizontal ? 'horizontal' : 'vertical',
    width,
    height,
    padding: [spacing.md, spacing.lg] as [number, number],
    gap: isHorizontal ? spacing.md : spacing.sm,
    alignItems: isHorizontal ? 'center' : ('center' as any),
    fillColor: fillColor ?? colors?.fill ?? theme.canvas,
    borderColor: borderColor ?? colors?.softBorder ?? theme.connector.color,
    borderWidth: borderWidth ?? borders.card.width,
    borderRadius: borderRadius ?? borders.card.radius,
    children: [iconNode, textContainer],
  }) as WBNode;
}

// ─── Badge ──────────────────────────────────────────────────────────────────

/**
 * Small pill-shaped label.
 *
 * ```tsx
 * <Badge text="v2.0" colorGroup="blue" />
 * ```
 */
export function Badge(props: BadgeProps): WBNode {
  const {
    text,
    colorGroup,
    fillColor,
    textColor,
    fontSize = typography.meta.fontSize,
    borderRadius = borders.badge.radius,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);

  return clean({
    type: 'frame',
    layout: 'horizontal',
    width: 'fit-content' as any,
    height: 'fit-content' as any,
    padding: [spacing.xs, spacing.sm] as [number, number],
    borderRadius,
    fillColor: fillColor ?? colors?.badgeBg ?? theme.text.meta,
    children: [
      clean({
        type: 'text',
        width: 'fit-content' as any,
        height: 'fit-content' as any,
        text: processText(text),
        fontSize,
        textColor: textColor ?? colors?.border ?? theme.canvas,
      }),
    ],
  }) as WBNode;
}

// ─── Section ────────────────────────────────────────────────────────────────

/**
 * Titled section container. Sets colorGroup for child components.
 *
 * ```tsx
 * <Section title="Backend Services" colorGroup="blue" gap={16}>
 *   <Card id="a" title="Service A" />
 * </Section>
 * ```
 */
export function Section(props: SectionProps): WBNode {
  const {
    id,
    title,
    titleFontSize,
    colorGroup,
    children,
    gap = spacing.md,
    padding,
    width = 'fill-container' as any,
    height = 'fit-content' as any,
    fillColor,
    borderColor,
    borderWidth,
    borderDash,
    borderRadius,
    ...rest
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);

  // Set colorGroup context for children
  const prevColorGroup = getColorGroup();
  if (colorGroup) setColorGroup(colorGroup);

  const sectionChildren: WBChild[] = [];

  // Title text
  sectionChildren.push(clean({
    type: 'text',
    width: 'fit-content' as any,
    height: 'fit-content' as any,
    text: processText(title),
    fontSize: titleFontSize ?? typography.h2.fontSize,
    textColor: colors?.border ?? theme.text.primary,
  }) as WBChild);

  // Children
  sectionChildren.push(...flattenChildren(children));

  // Restore previous colorGroup
  setColorGroup(prevColorGroup);

  return clean({
    type: 'frame',
    id,
    layout: 'vertical',
    width,
    height,
    gap,
    padding: padding ?? [spacing.xl, spacing.xl],
    fillColor: fillColor ?? colors?.bg ?? theme.canvas,
    borderColor: borderColor ?? colors?.border ?? theme.connector.color,
    borderWidth: borderWidth ?? (colors ? borders.partition.width : undefined),
    borderDash,
    borderRadius: borderRadius ?? borders.partition.radius,
    ...rest,
    children: sectionChildren,
  }) as WBNode;
}

// ─── LabeledRow ─────────────────────────────────────────────────────────────

/**
 * Label-Outside pattern: fixed-width label on the left, content fills remaining space.
 * Common in architecture diagrams for layer names.
 *
 * ```tsx
 * <LabeledRow label="接入层" labelWidth={80} colorGroup="blue">
 *   <HStack gap={12}>...</HStack>
 * </LabeledRow>
 * ```
 */
export function LabeledRow(props: LabeledRowProps): WBNode {
  const {
    id,
    label,
    labelWidth = 80,
    colorGroup,
    children,
    gap = spacing.md,
    width = 'fill-container' as any,
    height = 'fit-content' as any,
    ...rest
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);

  const labelNode = clean({
    type: 'text',
    width: labelWidth,
    height: 'fit-content' as any,
    text: processText(label),
    fontSize: typography.h2.fontSize,
    textColor: colors?.border ?? theme.text.primary,
    textAlign: 'right',
    verticalAlign: 'middle',
  }) as WBChild;

  // Content wrapper
  const contentChildren = flattenChildren(children);
  const contentNode = contentChildren.length === 1
    ? contentChildren[0]
    : clean({
        type: 'frame',
        layout: 'horizontal',
        width: 'fill-container' as any,
        height: 'fit-content' as any,
        gap: spacing.sm,
        children: contentChildren,
      }) as WBChild;

  return clean({
    type: 'frame',
    id,
    layout: 'horizontal',
    width,
    height,
    gap,
    alignItems: 'center',
    ...rest,
    children: [labelNode, contentNode],
  }) as WBNode;
}

// ─── Internal: Divider Line Helper ─────────────────────────────────────────

function makeDividerLine(
  color: string,
  thickness: number = 1,
  direction: 'horizontal' | 'vertical' = 'horizontal',
): WBChild {
  return clean({
    type: 'rect',
    width: direction === 'horizontal' ? ('fill-container' as any) : thickness,
    height: direction === 'horizontal' ? thickness : ('fill-container' as any),
    fillColor: color,
    borderWidth: 0,
  }) as WBChild;
}

// ─── Divider ───────────────────────────────────────────────────────────────

/**
 * Visual separator line with optional centered label.
 *
 * ```tsx
 * <Divider />
 * <Divider label="OR" />
 * <Divider direction="vertical" />
 * ```
 */
export function Divider(props: DividerProps): WBNode {
  const {
    id,
    direction = 'horizontal',
    color,
    thickness = borders.divider.width,
    dash,
    label,
    labelFontSize,
    colorGroup,
    width = direction === 'horizontal' ? ('fill-container' as any) : undefined,
    height = direction === 'vertical' ? ('fill-container' as any) : undefined,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);
  const lineColor = color ?? colors?.softBorder ?? theme.text.meta;

  // Simple line (no label)
  if (!label) {
    return clean({
      type: 'rect',
      id,
      width: direction === 'horizontal' ? width : thickness,
      height: direction === 'horizontal' ? thickness : height,
      fillColor: lineColor,
      borderWidth: 0,
    }) as WBNode;
  }

  // Labeled divider: ── Label ──
  return clean({
    type: 'frame',
    id,
    layout: 'horizontal',
    width,
    height: 'fit-content' as any,
    gap: spacing.sm,
    alignItems: 'center',
    children: [
      makeDividerLine(lineColor, thickness),
      clean({
        type: 'text',
        width: 'fit-content' as any,
        height: 'fit-content' as any,
        text: processText(label),
        fontSize: labelFontSize ?? typography.meta.fontSize,
        textColor: colors?.text ?? theme.text.secondary,
      }) as WBChild,
      makeDividerLine(lineColor, thickness),
    ],
  }) as WBNode;
}

// ─── BulletList ────────────────────────────────────────────────────────────

/**
 * Ordered or unordered list, embeddable in any container.
 *
 * ```tsx
 * <BulletList items={['Item A', 'Item B', 'Item C']} />
 * <BulletList ordered items={['First', 'Second', 'Third']} />
 * ```
 */
export function BulletList(props: BulletListProps): WBNode {
  const {
    id,
    items,
    ordered = false,
    bullet = '\u2022',
    startNumber = 1,
    colorGroup,
    gap = spacing.xs,
    fontSize = typography.body.fontSize,
    width = 'fill-container' as any,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);

  const listChildren: WBChild[] = items.map((item, index) => {
    const isObj = typeof item === 'object' && item !== null;
    const text = isObj ? (item as BulletListItem).text : (item as string);
    const itemIcon = isObj ? (item as BulletListItem).icon : undefined;

    // Bullet/number/icon prefix
    const prefixNode: WBChild = itemIcon
      ? clean({
          type: 'icon',
          name: itemIcon,
          color: colors?.border ?? theme.text.secondary,
          width: iconSize.sm,
          height: iconSize.sm,
        }) as WBChild
      : clean({
          type: 'text',
          width: 'fit-content' as any,
          height: 'fit-content' as any,
          text: ordered ? `${startNumber + index}.` : bullet,
          fontSize,
          textColor: colors?.border ?? theme.text.secondary,
        }) as WBChild;

    return clean({
      type: 'frame',
      layout: 'horizontal',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      gap: 6,
      alignItems: 'start',
      children: [
        prefixNode,
        clean({
          type: 'text',
          width: 'fill-container' as any,
          height: 'fit-content' as any,
          text: processText(text),
          fontSize,
          textColor: colors?.text ?? theme.text.primary,
        }) as WBChild,
      ],
    }) as WBChild;
  });

  return clean({
    type: 'frame',
    id,
    layout: 'vertical',
    width,
    height: 'fit-content' as any,
    gap,
    children: listChildren,
  }) as WBNode;
}

// ─── Legend ─────────────────────────────────────────────────────────────────

/**
 * Diagram legend/key with color swatches and labels.
 *
 * ```tsx
 * <Legend
 *   title="Legend"
 *   items={[
 *     { color: '#5178C6', label: 'Primary' },
 *     { color: '#509863', label: 'Secondary' },
 *   ]}
 * />
 * ```
 */
export function Legend(props: LegendProps): WBNode {
  const {
    id,
    title,
    items,
    direction = 'horizontal',
    colorGroup,
    width = 'fit-content' as any,
    fillColor,
    borderColor,
    borderRadius = borders.card.radius,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);

  const legendChildren: WBChild[] = [];

  if (title) {
    legendChildren.push(clean({
      type: 'text',
      width: 'fit-content' as any,
      height: 'fit-content' as any,
      text: processText(title),
      fontSize: typography.h3.fontSize,
      textColor: colors?.text ?? theme.text.primary,
    }) as WBChild);
  }

  const itemNodes: WBChild[] = items.map((item: LegendItem) =>
    clean({
      type: 'frame',
      layout: 'horizontal',
      width: 'fit-content' as any,
      height: 'fit-content' as any,
      gap: 6,
      alignItems: 'center',
      children: [
        clean({
          type: 'rect',
          width: 12,
          height: 12,
          fillColor: item.color,
          borderRadius: 2,
          borderWidth: 0,
        }) as WBChild,
        clean({
          type: 'text',
          width: 'fit-content' as any,
          height: 'fit-content' as any,
          text: processText(item.label),
          fontSize: typography.sub.fontSize,
          textColor: theme.text.secondary,
        }) as WBChild,
      ],
    }) as WBChild,
  );

  legendChildren.push(clean({
    type: 'frame',
    layout: direction === 'horizontal' ? 'horizontal' : 'vertical',
    width: 'fit-content' as any,
    height: 'fit-content' as any,
    gap: direction === 'horizontal' ? spacing.md : spacing.sm,
    children: itemNodes,
  }) as WBChild);

  return clean({
    type: 'frame',
    id,
    layout: 'vertical',
    width,
    height: 'fit-content' as any,
    padding: [spacing.md, spacing.lg] as [number, number],
    gap: spacing.md,
    fillColor: fillColor ?? colors?.fill ?? theme.canvas,
    borderColor: borderColor ?? colors?.softBorder ?? theme.connector.color,
    borderWidth: borders.card.width,
    borderRadius,
    children: legendChildren,
  }) as WBNode;
}

// ─── Callout ───────────────────────────────────────────────────────────────

const calloutColorMap: Record<CalloutVariant, ColorGroupName> = {
  info: 'blue',
  warning: 'yellow',
  success: 'green',
  note: 'purple',
};

const calloutIconMap: Record<CalloutVariant, string> = {
  info: 'info-circle',
  warning: 'warning-triangle',
  success: 'check-circle',
  note: 'edit',
};

/**
 * Highlighted annotation box with semantic variant.
 *
 * ```tsx
 * <Callout variant="info" title="Note" body="This endpoint requires authentication." />
 * <Callout variant="warning" title="Caution">
 *   <BulletList items={['Check permissions', 'Validate input']} />
 * </Callout>
 * ```
 */
export function Callout(props: CalloutProps): WBNode {
  const {
    id,
    variant = 'info',
    title,
    body,
    icon,
    children,
    colorGroup,
    width = 'fill-container' as any,
    fillColor,
    borderColor,
    borderRadius = borders.card.radius,
  } = props;

  const theme = getTheme();
  const resolvedGroup = colorGroup ?? calloutColorMap[variant];
  const colors = resolveColorGroup(resolvedGroup);
  const resolvedIcon = icon ?? calloutIconMap[variant];

  // Save/restore colorGroup context
  const prevColorGroup = getColorGroup();
  if (resolvedGroup) setColorGroup(resolvedGroup);

  const contentChildren: WBChild[] = [];

  if (title) {
    contentChildren.push(clean({
      type: 'text',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      text: processText(title),
      fontSize: typography.h3.fontSize,
      textColor: colors?.text ?? theme.text.primary,
    }) as WBChild);
  }

  if (body) {
    contentChildren.push(clean({
      type: 'text',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      text: processText(body),
      fontSize: typography.body.fontSize,
      textColor: theme.text.secondary,
    }) as WBChild);
  }

  if (children) {
    contentChildren.push(...flattenChildren(children));
  }

  // Restore colorGroup
  setColorGroup(prevColorGroup);

  return clean({
    type: 'frame',
    id,
    layout: 'horizontal',
    width,
    height: 'fit-content' as any,
    gap: spacing.md,
    padding: [spacing.md, spacing.lg] as [number, number],
    alignItems: 'start',
    fillColor: fillColor ?? colors?.bg ?? theme.canvas,
    borderColor: borderColor ?? colors?.border ?? theme.connector.color,
    borderWidth: borders.partition.width,
    borderRadius,
    children: [
      clean({
        type: 'icon',
        name: resolvedIcon,
        color: colors?.border ?? theme.text.primary,
        width: iconSize.md,
        height: iconSize.md,
      }) as WBChild,
      clean({
        type: 'frame',
        layout: 'vertical',
        width: 'fill-container' as any,
        height: 'fit-content' as any,
        gap: 4,
        children: contentChildren,
      }) as WBChild,
    ],
  }) as WBNode;
}

// ─── DetailCard ────────────────────────────────────────────────────────────

/**
 * Rich multi-section card: header (icon + title/subtitle) → divider → body (entries + children) → footer.
 *
 * ```tsx
 * <DetailCard
 *   id="api-spec"
 *   icon="api"
 *   title="**GET /users**"
 *   subtitle="List all users"
 *   entries={[{ key: 'Auth', value: 'Bearer Token' }, { key: 'Rate', value: '100/min' }]}
 *   footer={[Badge({ text: 'v2', colorGroup: 'blue' })]}
 * >
 *   <BulletList items={['Pagination', 'Filtering']} />
 * </DetailCard>
 * ```
 */
export function DetailCard(props: DetailCardProps): WBNode {
  const {
    id,
    icon,
    iconColor,
    title,
    subtitle,
    entries,
    children,
    footer,
    colorGroup,
    width = 'fill-container' as any,
    maxWidth = 400,
    height = 'fit-content' as any,
    fillColor,
    borderColor,
    borderWidth,
    borderRadius,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);

  // Save/restore colorGroup context
  const prevColorGroup = getColorGroup();
  if (colorGroup) setColorGroup(colorGroup);

  const cardChildren: WBChild[] = [];

  // ── Header section ──
  const headerChildren: WBChild[] = [];

  if (icon) {
    headerChildren.push(clean({
      type: 'icon',
      name: icon,
      color: iconColor ?? colors?.border ?? theme.text.primary,
      width: iconSize.lg,
      height: iconSize.lg,
    }) as WBChild);
  }

  const titleGroup: WBChild[] = [
    clean({
      type: 'text',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      text: processText(title),
      fontSize: typography.h3.fontSize,
      textColor: colors?.text ?? theme.text.primary,
    }) as WBChild,
  ];

  if (subtitle) {
    titleGroup.push(clean({
      type: 'text',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      text: processText(truncateText(subtitle, 60)),
      fontSize: typography.sub.fontSize,
      textColor: theme.text.secondary,
    }) as WBChild);
  }

  headerChildren.push(clean({
    type: 'frame',
    layout: 'vertical',
    width: 'fill-container' as any,
    height: 'fit-content' as any,
    gap: 2,
    children: titleGroup,
  }) as WBChild);

  // If icon present, header is horizontal (icon + text group)
  if (icon) {
    cardChildren.push(clean({
      type: 'frame',
      layout: 'horizontal',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      gap: spacing.sm,
      alignItems: 'center',
      children: headerChildren,
    }) as WBChild);
  } else {
    // No icon, just add title group children directly
    cardChildren.push(...titleGroup);
  }

  // ── Divider between header and body ──
  const hasBody = (entries && entries.length > 0) || children;
  if (hasBody) {
    cardChildren.push(makeDividerLine(colors?.softBorder ?? theme.text.meta));
  }

  // ── Body: entries (key-value rows) ──
  if (entries && entries.length > 0) {
    const entryNodes: WBChild[] = entries.map((entry: DetailCardEntry) =>
      clean({
        type: 'frame',
        layout: 'horizontal',
        width: 'fill-container' as any,
        height: 'fit-content' as any,
        gap: spacing.sm,
        children: [
          clean({
            type: 'text',
            width: 'fit-content' as any,
            height: 'fit-content' as any,
            text: processText(entry.key),
            fontSize: typography.sub.fontSize,
            textColor: theme.text.meta,
          }) as WBChild,
          clean({
            type: 'text',
            width: 'fill-container' as any,
            height: 'fit-content' as any,
            text: processText(truncateText(entry.value, 80)),
            fontSize: typography.sub.fontSize,
            textColor: colors?.text ?? theme.text.primary,
          }) as WBChild,
        ],
      }) as WBChild,
    );

    cardChildren.push(clean({
      type: 'frame',
      layout: 'vertical',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      gap: spacing.xs,
      children: entryNodes,
    }) as WBChild);
  }

  // ── Body: arbitrary children ──
  if (children) {
    cardChildren.push(...flattenChildren(children));
  }

  // ── Footer ──
  if (footer) {
    cardChildren.push(makeDividerLine(colors?.softBorder ?? theme.text.meta));
    cardChildren.push(clean({
      type: 'frame',
      layout: 'horizontal',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      gap: spacing.xs,
      children: flattenChildren(footer),
    }) as WBChild);
  }

  // Restore colorGroup
  setColorGroup(prevColorGroup);

  return clean({
    type: 'frame',
    id,
    layout: 'vertical',
    width,
    height,
    padding: [spacing.md, spacing.lg] as [number, number],
    gap: spacing.md,
    fillColor: fillColor ?? colors?.fill ?? theme.canvas,
    borderColor: borderColor ?? colors?.softBorder ?? theme.connector.color,
    borderWidth: borderWidth ?? borders.card.width,
    borderRadius: borderRadius ?? borders.card.radius,
    children: cardChildren,
  }) as WBNode;
}

// ─── Table ─────────────────────────────────────────────────────────────────

/**
 * Grid table with optional headers, striped rows, and component cells.
 *
 * ```tsx
 * <Table
 *   headers={['Name', 'Type', 'Required']}
 *   rows={[
 *     ['page', 'integer', Badge({ text: 'No' })],
 *     ['limit', 'integer', Badge({ text: 'No' })],
 *   ]}
 *   striped
 * />
 * ```
 */
export function Table(props: TableProps): WBNode {
  const {
    id,
    headers,
    rows,
    columnWidths,
    columnAligns,
    striped = true,
    colorGroup,
    width = 'fill-container' as any,
    fillColor,
    borderColor,
    borderRadius = borders.table.radius,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);

  // Determine number of columns
  const colCount = headers?.length ?? (rows[0]?.length ?? 0);

  function getColWidth(colIndex: number): any {
    if (!columnWidths || colIndex >= columnWidths.length) return 'fill-container';
    const w = columnWidths[colIndex];
    return w === 'fill' ? 'fill-container' : w;
  }

  function getColAlign(colIndex: number): string {
    if (!columnAligns || colIndex >= columnAligns.length) return 'left';
    return columnAligns[colIndex];
  }

  function buildCell(content: TableCell, colIndex: number, isHeader: boolean): WBChild {
    const cellPadding: [number, number] = [6, 10];

    // String content → render as Text
    if (typeof content === 'string') {
      return clean({
        type: 'frame',
        layout: 'vertical',
        width: getColWidth(colIndex),
        height: 'fit-content' as any,
        padding: cellPadding,
        children: [
          clean({
            type: 'text',
            width: 'fill-container' as any,
            height: 'fit-content' as any,
            text: processText(content),
            fontSize: isHeader ? typography.h3.fontSize : typography.body.fontSize,
            textColor: isHeader
              ? (colors?.text ?? theme.text.primary)
              : theme.text.primary,
            textAlign: getColAlign(colIndex),
          }) as WBChild,
        ],
      }) as WBChild;
    }

    // Component content → place directly in cell frame
    const cellChildren = flattenChildren(content);
    return clean({
      type: 'frame',
      layout: 'vertical',
      width: getColWidth(colIndex),
      height: 'fit-content' as any,
      padding: cellPadding,
      children: cellChildren.length > 0 ? cellChildren : undefined,
    }) as WBChild;
  }

  function buildRow(cells: TableCell[], rowIndex: number, isHeader: boolean): WBChild {
    let rowFill: string | undefined;
    if (isHeader) {
      rowFill = colors?.badgeBg ?? theme.text.meta;
    } else if (striped) {
      rowFill = rowIndex % 2 === 0
        ? (colors?.fill ?? theme.canvas)
        : (colors?.bg ?? theme.canvas);
    } else {
      rowFill = colors?.fill ?? theme.canvas;
    }

    return clean({
      type: 'frame',
      layout: 'horizontal',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      gap: 0,
      fillColor: rowFill,
      children: cells.map((cell, colIndex) => buildCell(cell, colIndex, isHeader)),
    }) as WBChild;
  }

  const tableChildren: WBChild[] = [];

  // Header row
  if (headers && headers.length > 0) {
    tableChildren.push(buildRow(headers, -1, true));
  }

  // Data rows
  rows.forEach((row, rowIndex) => {
    tableChildren.push(buildRow(row, rowIndex, false));
  });

  return clean({
    type: 'frame',
    id,
    layout: 'vertical',
    width,
    height: 'fit-content' as any,
    gap: 0,
    fillColor: fillColor ?? colors?.fill ?? theme.canvas,
    borderColor: borderColor ?? colors?.softBorder ?? theme.connector.color,
    borderWidth: borders.table.width,
    borderRadius,
    children: tableChildren,
  }) as WBNode;
}

// ─── Figure ────────────────────────────────────────────────────────────────

/**
 * Academic figure wrapper with label, title, content, and caption.
 *
 * ```tsx
 * <Figure label="Figure 1" title="System Architecture" caption="Overview of the three-tier design.">
 *   <Section title="Layer A" colorGroup="blue">...</Section>
 * </Figure>
 * ```
 */
export function Figure(props: FigureProps): WBNode {
  const {
    id,
    label,
    title,
    children,
    caption,
    colorGroup,
    width = 'fill-container' as any,
    fillColor,
    borderColor,
    borderWidth,
    borderRadius = borders.partition.radius,
    padding,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);

  // Save/restore colorGroup context
  const prevColorGroup = getColorGroup();
  if (colorGroup) setColorGroup(colorGroup);

  const figureChildren: WBChild[] = [];

  // Header: label + title
  if (label || title) {
    const headerParts: string[] = [];
    if (label) headerParts.push(`**${label}**`);
    if (title) headerParts.push(title);
    const headerText = headerParts.join('  ');

    figureChildren.push(clean({
      type: 'text',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      text: processText(headerText),
      fontSize: typography.h2.fontSize,
      textColor: colors?.text ?? theme.text.primary,
      textAlign: 'center',
    }) as WBChild);
  }

  // Content area
  if (children) {
    figureChildren.push(...flattenChildren(children));
  }

  // Caption
  if (caption) {
    figureChildren.push(clean({
      type: 'text',
      width: 'fill-container' as any,
      height: 'fit-content' as any,
      text: processText(caption),
      fontSize: typography.sub.fontSize,
      textColor: theme.text.secondary,
      textAlign: 'center',
    }) as WBChild);
  }

  // Restore colorGroup
  setColorGroup(prevColorGroup);

  return clean({
    type: 'frame',
    id,
    layout: 'vertical',
    width,
    height: 'fit-content' as any,
    gap: spacing.md,
    padding: padding ?? [spacing.lg, spacing.lg],
    fillColor: fillColor ?? colors?.bg ?? theme.canvas,
    borderColor: borderColor ?? colors?.softBorder ?? theme.connector.color,
    borderWidth: borderWidth ?? borders.card.width,
    borderRadius,
    children: figureChildren,
  }) as WBNode;
}

// ─── Pipeline ──────────────────────────────────────────────────────────────

/**
 * Sequential flow with auto-generated connectors between steps.
 *
 * ```tsx
 * <Pipeline
 *   direction="horizontal"
 *   steps={[
 *     { id: 'parse', title: 'Parse', icon: 'code' },
 *     { id: 'validate', title: 'Validate', icon: 'check-circle' },
 *     { id: 'deploy', title: 'Deploy', icon: 'rocket' },
 *   ]}
 * />
 * ```
 */
export function Pipeline(props: PipelineProps): WBNode {
  const {
    id,
    steps,
    direction = 'horizontal',
    connectorVariant = 'main',
    lineShape,
    gap = spacing.xl,
    colorGroup,
    width = direction === 'horizontal' ? ('fill-container' as any) : ('fit-content' as any),
    height = 'fit-content' as any,
  } = props;

  const theme = getTheme();
  const colors = resolveColorGroup(colorGroup);
  const defaults = connectorDefaults[connectorVariant];

  // Save/restore colorGroup context
  const prevColorGroup = getColorGroup();
  if (colorGroup) setColorGroup(colorGroup);

  const isHorizontal = direction === 'horizontal';

  // Build step nodes
  const stepNodes: WBChild[] = steps.map((step: PipelineStep) => {
    const stepChildren = step.children ? flattenChildren(step.children) : [];

    if (step.icon) {
      // IconCard-style step
      const iconNode = clean({
        type: 'icon',
        name: step.icon,
        color: colors?.border ?? theme.text.primary,
        width: iconSize.lg,
        height: iconSize.lg,
      }) as WBChild;

      const textChildren: WBChild[] = [
        clean({
          type: 'text',
          width: 'fill-container' as any,
          height: 'fit-content' as any,
          text: processText(step.title),
          fontSize: typography.h3.fontSize,
          textColor: colors?.text ?? theme.text.primary,
        }) as WBChild,
      ];

      if (step.subtitle) {
        textChildren.push(clean({
          type: 'text',
          width: 'fill-container' as any,
          height: 'fit-content' as any,
          text: processText(step.subtitle),
          fontSize: typography.sub.fontSize,
          textColor: theme.text.secondary,
        }) as WBChild);
      }

      const mainChildren: WBChild[] = [
        clean({
          type: 'frame',
          layout: 'horizontal',
          width: 'fill-container' as any,
          height: 'fit-content' as any,
          gap: spacing.sm,
          alignItems: 'center',
          children: [
            iconNode,
            clean({
              type: 'frame',
              layout: 'vertical',
              width: 'fill-container' as any,
              height: 'fit-content' as any,
              gap: 2,
              children: textChildren,
            }) as WBChild,
          ],
        }) as WBChild,
      ];

      if (stepChildren.length > 0) {
        mainChildren.push(...stepChildren);
      }

      return clean({
        type: 'frame',
        id: step.id,
        layout: 'vertical',
        width: isHorizontal ? ('fill-container(160)' as any) : ('fill-container' as any),
        height: 'fit-content' as any,
        padding: [spacing.md, spacing.lg] as [number, number],
        gap: spacing.sm,
        fillColor: colors?.fill ?? theme.canvas,
        borderColor: colors?.softBorder ?? theme.connector.color,
        borderWidth: borders.card.width,
        borderRadius: borders.card.radius,
        children: mainChildren,
      }) as WBChild;
    } else {
      // Simple Card-style step (no icon)
      const mainChildren: WBChild[] = [
        clean({
          type: 'text',
          width: 'fill-container' as any,
          height: 'fit-content' as any,
          text: processText(step.title),
          fontSize: typography.h3.fontSize,
          textColor: colors?.text ?? theme.text.primary,
        }) as WBChild,
      ];

      if (step.subtitle) {
        mainChildren.push(clean({
          type: 'text',
          width: 'fill-container' as any,
          height: 'fit-content' as any,
          text: processText(step.subtitle),
          fontSize: typography.sub.fontSize,
          textColor: theme.text.secondary,
        }) as WBChild);
      }

      if (stepChildren.length > 0) {
        mainChildren.push(...stepChildren);
      }

      return clean({
        type: 'frame',
        id: step.id,
        layout: 'vertical',
        width: isHorizontal ? ('fill-container(160)' as any) : ('fill-container' as any),
        height: 'fit-content' as any,
        padding: [spacing.md, spacing.lg] as [number, number],
        gap: spacing.sm,
        fillColor: colors?.fill ?? theme.canvas,
        borderColor: colors?.softBorder ?? theme.connector.color,
        borderWidth: borders.card.width,
        borderRadius: borders.card.radius,
        children: mainChildren,
      }) as WBChild;
    }
  });

  // Auto-generate connectors between consecutive steps
  const connectorNodes: WBChild[] = [];
  const pipelineId = id ?? 'pipeline';
  for (let i = 0; i < steps.length - 1; i++) {
    connectorNodes.push(clean({
      type: 'connector',
      id: `${pipelineId}-conn-${i}`,
      connector: clean({
        from: steps[i].id,
        to: steps[i + 1].id,
        fromAnchor: isHorizontal ? 'right' : 'bottom',
        toAnchor: isHorizontal ? 'left' : 'top',
        lineShape: lineShape ?? 'straight',
        lineColor: theme.connector.color,
        lineWidth: defaults.lineWidth,
        lineStyle: defaults.lineStyle,
        endArrow: 'arrow',
      }),
    }) as WBChild);
  }

  // Restore colorGroup
  setColorGroup(prevColorGroup);

  return clean({
    type: 'frame',
    id,
    layout: isHorizontal ? 'horizontal' : 'vertical',
    width,
    height,
    gap,
    alignItems: isHorizontal ? 'stretch' : undefined,
    children: [...stepNodes, ...connectorNodes],
  }) as WBNode;
}
