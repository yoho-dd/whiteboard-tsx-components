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
  groups: {
    blue:   { bg: '#EDF2F7', fill: '#FFFFFF', border: '#4A6FA5', softBorder: '#B0C4DE', text: '#1A202C', badgeBg: '#EDF2F7' },
    purple: { bg: '#E8EDF3', fill: '#FFFFFF', border: '#5A7B9A', softBorder: '#A8BDD4', text: '#1A202C', badgeBg: '#E8EDF3' },
    green:  { bg: '#E8EDF3', fill: '#FFFFFF', border: '#5A7B9A', softBorder: '#A8BDD4', text: '#1A202C', badgeBg: '#E8EDF3' },
    yellow: { bg: '#F0F0F0', fill: '#FFFFFF', border: '#8895A7', softBorder: '#C0C8D4', text: '#1A202C', badgeBg: '#F0F0F0' },
    red:    { bg: '#EDF2F7', fill: '#FFFFFF', border: '#4A6FA5', softBorder: '#B0C4DE', text: '#1A202C', badgeBg: '#EDF2F7' },
  },
  text: { primary: '#1A202C', secondary: '#4A5568', meta: '#718096', white: '#FFFFFF' },
  emphasis: { fill: '#2D4A7A', border: '#2D4A7A', text: '#FFFFFF' },
  connector: { color: '#718BAE', width: 1.5 },
};

const tech: Theme = {
  name: 'tech',
  groups: {
    blue:   { bg: '#1E293B', fill: '#1E293B', border: '#3B82F6', softBorder: '#334155', text: '#E2E8F0', badgeBg: '#0F172A' },
    purple: { bg: '#1E293B', fill: '#1E293B', border: '#8B5CF6', softBorder: '#334155', text: '#E2E8F0', badgeBg: '#0F172A' },
    green:  { bg: '#1E293B', fill: '#1E293B', border: '#10B981', softBorder: '#334155', text: '#E2E8F0', badgeBg: '#0F172A' },
    yellow: { bg: '#1E293B', fill: '#1E293B', border: '#F59E0B', softBorder: '#334155', text: '#E2E8F0', badgeBg: '#0F172A' },
    red:    { bg: '#1E293B', fill: '#1E293B', border: '#EF4444', softBorder: '#334155', text: '#E2E8F0', badgeBg: '#0F172A' },
  },
  text: { primary: '#E2E8F0', secondary: '#94A3B8', meta: '#64748B', white: '#FFFFFF' },
  emphasis: { fill: '#2563EB', border: '#3B82F6', text: '#FFFFFF' },
  connector: { color: '#475569', width: 1.5 },
};

const fresh: Theme = {
  name: 'fresh',
  groups: {
    blue:   { bg: '#ECFDF5', fill: '#FFFFFF', border: '#6EE7B7', softBorder: '#A7F3D0', text: '#14532D', badgeBg: '#ECFDF5' },
    purple: { bg: '#F0FDFA', fill: '#FFFFFF', border: '#5EEAD4', softBorder: '#99F6E4', text: '#134E4A', badgeBg: '#F0FDFA' },
    green:  { bg: '#F0FDF4', fill: '#FFFFFF', border: '#86EFAC', softBorder: '#BBF7D0', text: '#14532D', badgeBg: '#F0FDF4' },
    yellow: { bg: '#DCFCE7', fill: '#FFFFFF', border: '#4ADE80', softBorder: '#86EFAC', text: '#14532D', badgeBg: '#DCFCE7' },
    red:    { bg: '#ECFDF5', fill: '#FFFFFF', border: '#6EE7B7', softBorder: '#A7F3D0', text: '#14532D', badgeBg: '#ECFDF5' },
  },
  text: { primary: '#14532D', secondary: '#166534', meta: '#15803D', white: '#FFFFFF' },
  emphasis: { fill: '#16A34A', border: '#16A34A', text: '#FFFFFF' },
  connector: { color: '#86EFAC', width: 1.5 },
};

const minimalist: Theme = {
  name: 'minimalist',
  groups: {
    blue:   { bg: '#F8F9FA', fill: '#FFFFFF', border: '#DEE2E6', softBorder: '#E9ECEF', text: '#212529', badgeBg: '#F8F9FA' },
    purple: { bg: '#E9ECEF', fill: '#FFFFFF', border: '#ADB5BD', softBorder: '#CED4DA', text: '#212529', badgeBg: '#E9ECEF' },
    green:  { bg: '#F1F3F5', fill: '#FFFFFF', border: '#868E96', softBorder: '#ADB5BD', text: '#212529', badgeBg: '#F1F3F5' },
    yellow: { bg: '#F8F9FA', fill: '#FFFFFF', border: '#ADB5BD', softBorder: '#CED4DA', text: '#212529', badgeBg: '#F8F9FA' },
    red:    { bg: '#F8F9FA', fill: '#FFFFFF', border: '#CED4DA', softBorder: '#DEE2E6', text: '#212529', badgeBg: '#F8F9FA' },
  },
  text: { primary: '#212529', secondary: '#495057', meta: '#868E96', white: '#FFFFFF' },
  emphasis: { fill: '#495057', border: '#495057', text: '#FFFFFF' },
  connector: { color: '#ADB5BD', width: 1.5 },
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
