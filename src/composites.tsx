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
  type ColorGroupName,
} from './theme.js';
import type {
  CardProps,
  IconCardProps,
  BadgeProps,
  SectionProps,
  LabeledRowProps,
} from './types.js';
import type { WBNode, WBChild } from '@larksuite/whiteboard-cli/auto-layout-dsl/types';

// ─── Internal Helpers ───────────────────────────────────────────────────────

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
    width = 'fill-container(200)',
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
      text: processText(subtitle),
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
    padding: [10, 16] as [number, number],
    gap: 4,
    fillColor: fillColor ?? colors?.fill ?? '#FFFFFF',
    borderColor: borderColor ?? colors?.softBorder ?? theme.text.meta,
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
    width = 'fill-container(200)',
    height = 'fit-content',
    fillColor,
    borderColor,
    borderWidth,
    borderRadius,
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
      text: processText(subtitle),
      fontSize: typography.sub.fontSize,
      textColor: theme.text.secondary,
    }) as WBChild);
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
    padding: [10, 16] as [number, number],
    gap: isHorizontal ? 10 : 8,
    alignItems: isHorizontal ? 'center' : ('center' as any),
    fillColor: fillColor ?? colors?.fill ?? '#FFFFFF',
    borderColor: borderColor ?? colors?.softBorder ?? theme.text.meta,
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
    padding: [2, 8] as [number, number],
    borderRadius,
    fillColor: fillColor ?? colors?.badgeBg ?? '#F0F4FC',
    children: [
      clean({
        type: 'text',
        width: 'fit-content' as any,
        height: 'fit-content' as any,
        text: processText(text),
        fontSize,
        textColor: textColor ?? colors?.border ?? theme.text.secondary,
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
    padding: padding ?? [spacing.lg, spacing.lg],
    fillColor: fillColor ?? colors?.bg ?? '#F8FAFC',
    borderColor: borderColor ?? colors?.border,
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
    height,
    gap,
    alignItems: 'center',
    ...rest,
    children: [labelNode, contentNode],
  }) as WBNode;
}
