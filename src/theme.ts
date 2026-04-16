/**
 * Design Tokens — Whiteboard Component Library
 *
 * 5 preset themes with color groups, typography, spacing, borders, icons, and connector styles.
 * Components use these tokens as defaults; all values can be overridden with direct HEX/number props.
 */

// ─── Color Group ────────────────────────────────────────────────────────────

export interface ColorGroup {
  /** Partition/section background (light fill) */
  bg: string;
  /** Inner node fill (usually white) */
  fill: string;
  /** Border color (deep/saturated) */
  border: string;
  /** Soft border for cards within partitions */
  softBorder: string;
  /** Text color for labels/titles in this group */
  text: string;
  /** Badge background color */
  badgeBg: string;
}

export type ColorGroupName = 'blue' | 'purple' | 'green' | 'yellow' | 'red';

// ─── Theme ──────────────────────────────────────────────────────────────────

export interface Theme {
  name: string;
  /** Surface color for the diagram background */
  canvas: string;
  groups: Record<ColorGroupName, ColorGroup>;
  text: {
    primary: string;
    secondary: string;
    meta: string;
    white: string;
  };
  emphasis: {
    fill: string;
    border: string;
    text: string;
  };
  connector: {
    color: string;
    width: number;
  };
}

export type ThemeName = 'classic' | 'business' | 'tech' | 'fresh' | 'minimalist';

// ─── Theme Definitions ──────────────────────────────────────────────────────

const classic: Theme = {
  name: 'classic',
  canvas: '#FFFFFF',
  groups: {
    blue:   { bg: '#F0F4FC', fill: '#FFFFFF', border: '#5178C6', softBorder: '#C2D3EE', text: '#1F2329', badgeBg: '#F0F4FC' },
    purple: { bg: '#EAE2FE', fill: '#FFFFFF', border: '#8569CB', softBorder: '#CFC4E6', text: '#1F2329', badgeBg: '#F3F0FA' },
    green:  { bg: '#DFF5E5', fill: '#FFFFFF', border: '#509863', softBorder: '#C8E6CF', text: '#1F2329', badgeBg: '#F0FDF4' },
    yellow: { bg: '#FEF1CE', fill: '#FFFFFF', border: '#D4B45B', softBorder: '#E8D9A0', text: '#1F2329', badgeBg: '#FEF9E7' },
    red:    { bg: '#FEE3E2', fill: '#FFFFFF', border: '#D25D5A', softBorder: '#E8B4B3', text: '#1F2329', badgeBg: '#FEF2F2' },
  },
  text: { primary: '#1F2329', secondary: '#646A73', meta: '#8F959E', white: '#FFFFFF' },
  emphasis: { fill: '#1F2329', border: '#1F2329', text: '#FFFFFF' },
  connector: { color: '#BBBFC4', width: 1.5 },
};

const business: Theme = {
  name: 'business',
  canvas: '#F7FAFC',
  groups: {
    blue:   { bg: '#EBF8FF', fill: '#FFFFFF', border: '#3182CE', softBorder: '#BEE3F8', text: '#2A4365', badgeBg: '#EBF8FF' },
    purple: { bg: '#FAF5FF', fill: '#FFFFFF', border: '#805AD5', softBorder: '#E9D8FD', text: '#44337A', badgeBg: '#FAF5FF' },
    green:  { bg: '#F0FFF4', fill: '#FFFFFF', border: '#38A169', softBorder: '#C6F6D5', text: '#22543D', badgeBg: '#F0FFF4' },
    yellow: { bg: '#FFFFF0', fill: '#FFFFFF', border: '#D69E2E', softBorder: '#FEFCBF', text: '#744210', badgeBg: '#FFFFF0' },
    red:    { bg: '#FFF5F5', fill: '#FFFFFF', border: '#E53E3E', softBorder: '#FED7D7', text: '#742A2A', badgeBg: '#FFF5F5' },
  },
  text: { primary: '#1A202C', secondary: '#4A5568', meta: '#718096', white: '#FFFFFF' },
  emphasis: { fill: '#2B6CB0', border: '#2B6CB0', text: '#FFFFFF' },
  connector: { color: '#A0AEC0', width: 1.5 },
};

const tech: Theme = {
  name: 'tech',
  canvas: '#0F172A',
  groups: {
    blue:   { bg: '#1E293B', fill: '#334155', border: '#3B82F6', softBorder: '#475569', text: '#E2E8F0', badgeBg: '#1E293B' },
    purple: { bg: '#1E293B', fill: '#334155', border: '#8B5CF6', softBorder: '#475569', text: '#E2E8F0', badgeBg: '#1E293B' },
    green:  { bg: '#1E293B', fill: '#334155', border: '#10B981', softBorder: '#475569', text: '#E2E8F0', badgeBg: '#1E293B' },
    yellow: { bg: '#1E293B', fill: '#334155', border: '#F59E0B', softBorder: '#475569', text: '#E2E8F0', badgeBg: '#1E293B' },
    red:    { bg: '#1E293B', fill: '#334155', border: '#EF4444', softBorder: '#475569', text: '#E2E8F0', badgeBg: '#1E293B' },
  },
  text: { primary: '#F8FAFC', secondary: '#94A3B8', meta: '#64748B', white: '#FFFFFF' },
  emphasis: { fill: '#3B82F6', border: '#60A5FA', text: '#FFFFFF' },
  connector: { color: '#475569', width: 1.5 },
};

const fresh: Theme = {
  name: 'fresh',
  canvas: '#FFFFFF',
  groups: {
    blue:   { bg: '#E0F2FE', fill: '#FFFFFF', border: '#38BDF8', softBorder: '#BAE6FD', text: '#0C4A6E', badgeBg: '#E0F2FE' },
    purple: { bg: '#F3E8FF', fill: '#FFFFFF', border: '#C084FC', softBorder: '#E9D5FF', text: '#3B0764', badgeBg: '#F3E8FF' },
    green:  { bg: '#DCFCE7', fill: '#FFFFFF', border: '#4ADE80', softBorder: '#BBF7D0', text: '#14532D', badgeBg: '#DCFCE7' },
    yellow: { bg: '#FEF9C3', fill: '#FFFFFF', border: '#FACC15', softBorder: '#FEF08A', text: '#713F12', badgeBg: '#FEF9C3' },
    red:    { bg: '#FEE2E2', fill: '#FFFFFF', border: '#F87171', softBorder: '#FECACA', text: '#7F1D1D', badgeBg: '#FEE2E2' },
  },
  text: { primary: '#0F172A', secondary: '#475569', meta: '#64748B', white: '#FFFFFF' },
  emphasis: { fill: '#10B981', border: '#10B981', text: '#FFFFFF' },
  connector: { color: '#94A3B8', width: 1.5 },
};

const minimalist: Theme = {
  name: 'minimalist',
  canvas: '#FFFFFF',
  groups: {
    blue:   { bg: '#F8F9FA', fill: '#FFFFFF', border: '#4DABF7', softBorder: '#D0EBFF', text: '#212529', badgeBg: '#E7F5FF' },
    purple: { bg: '#F8F9FA', fill: '#FFFFFF', border: '#B197FC', softBorder: '#E5DBFF', text: '#212529', badgeBg: '#F3F0FF' },
    green:  { bg: '#F8F9FA', fill: '#FFFFFF', border: '#69DB7C', softBorder: '#D3F9D8', text: '#212529', badgeBg: '#EBFBEE' },
    yellow: { bg: '#F8F9FA', fill: '#FFFFFF', border: '#FFD43B', softBorder: '#FFF3BF', text: '#212529', badgeBg: '#FFF9DB' },
    red:    { bg: '#F8F9FA', fill: '#FFFFFF', border: '#FF8787', softBorder: '#FFE3E3', text: '#212529', badgeBg: '#FFF5F5' },
  },
  text: { primary: '#212529', secondary: '#495057', meta: '#868E96', white: '#FFFFFF' },
  emphasis: { fill: '#343A40', border: '#343A40', text: '#FFFFFF' },
  connector: { color: '#CED4DA', width: 1.5 },
};

export const themes: Record<ThemeName, Theme> = { classic, business, tech, fresh, minimalist };

// ─── Typography ─────────────────────────────────────────────────────────────

export const typography = {
  h1: { fontSize: 28, bold: true },
  h2: { fontSize: 18, bold: true },
  h3: { fontSize: 14, bold: true },
  body: { fontSize: 14, bold: false },
  sub: { fontSize: 11, bold: false },
  meta: { fontSize: 10, bold: false },
} as const;

// ─── Spacing ────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Borders ────────────────────────────────────────────────────────────────

export const borders = {
  partition: { width: 2, radius: 12 },
  card: { width: 1, radius: 8 },
  badge: { width: 1, radius: 4 },
  divider: { width: 1 },
  table: { width: 1, radius: 6 },
} as const;

// ─── Icon Sizes ─────────────────────────────────────────────────────────────

export const iconSize = {
  sm: 16,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

// ─── Connector Variants ─────────────────────────────────────────────────────

export type ConnectorVariant = 'main' | 'secondary' | 'async' | 'weak';

export const connectorDefaults: Record<ConnectorVariant, { lineWidth: number; lineStyle: string }> = {
  main: { lineWidth: 2, lineStyle: 'solid' },
  secondary: { lineWidth: 1, lineStyle: 'solid' },
  async: { lineWidth: 1, lineStyle: 'dashed' },
  weak: { lineWidth: 1, lineStyle: 'dotted' },
};

// ─── Grid ───────────────────────────────────────────────────────────────────

export const grid = {
  width: 1200,
} as const;

// ─── Runtime Theme State ────────────────────────────────────────────────────

let currentTheme: Theme = classic;
let currentColorGroup: ColorGroupName | undefined;

export function setTheme(name: ThemeName): void {
  currentTheme = themes[name];
}

export function getTheme(): Theme {
  return currentTheme;
}

export function setColorGroup(name: ColorGroupName | undefined): void {
  currentColorGroup = name;
}

export function getColorGroup(): ColorGroupName | undefined {
  return currentColorGroup;
}

export function resolveColorGroup(explicit?: ColorGroupName): ColorGroup | undefined {
  const name = explicit ?? currentColorGroup;
  if (!name) return undefined;
  return currentTheme.groups[name];
}
