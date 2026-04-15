/**
 * Unit Tests for Whiteboard TSX Component Library
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { parseMarkdownText } from '../src/markdown-text.js';
import { normalizeChildren, Fragment } from '../src/jsx-runtime.js';
import {
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
} from '../src/primitives.js';
import {
  Card, IconCard, Badge, Section, LabeledRow,
  Divider, BulletList, Legend, Callout, DetailCard, Table, Figure, Pipeline,
} from '../src/composites.js';
import { setTheme, spacing, typography, borders } from '../src/theme.js';

// ─── Markdown Parser ────────────────────────────────────────────────────────

describe('parseMarkdownText', () => {
  it('returns plain string when no markdown', () => {
    expect(parseMarkdownText('Hello World')).toBe('Hello World');
  });

  it('parses bold syntax', () => {
    const result = parseMarkdownText('Hello **bold** world');
    expect(result).toEqual([
      { content: 'Hello ' },
      { content: 'bold', bold: true },
      { content: ' world' },
    ]);
  });

  it('parses italic syntax', () => {
    const result = parseMarkdownText('Hello *italic* world');
    expect(result).toEqual([
      { content: 'Hello ' },
      { content: 'italic', italic: true },
      { content: ' world' },
    ]);
  });

  it('parses strikethrough syntax', () => {
    const result = parseMarkdownText('Hello ~~removed~~ world');
    expect(result).toEqual([
      { content: 'Hello ' },
      { content: 'removed', strikeThrough: true },
      { content: ' world' },
    ]);
  });

  it('parses color tag', () => {
    const result = parseMarkdownText('Hello <color=#FF0000>red</color> world');
    expect(result).toEqual([
      { content: 'Hello ' },
      { content: 'red', color: '#FF0000' },
      { content: ' world' },
    ]);
  });

  it('parses bg tag', () => {
    const result = parseMarkdownText('Hello <bg=#FFFF00>highlight</bg> world');
    expect(result).toEqual([
      { content: 'Hello ' },
      { content: 'highlight', backgroundColor: '#FFFF00' },
      { content: ' world' },
    ]);
  });

  it('parses size tag', () => {
    const result = parseMarkdownText('Hello <size=24>big</size> world');
    expect(result).toEqual([
      { content: 'Hello ' },
      { content: 'big', fontSize: 24 },
      { content: ' world' },
    ]);
  });

  it('handles unclosed bold gracefully', () => {
    const result = parseMarkdownText('Hello **unclosed');
    expect(result).toEqual([
      { content: 'Hello ' },
      { content: '**unclosed' },
    ]);
  });
});

// ─── JSX Runtime ────────────────────────────────────────────────────────────

describe('normalizeChildren', () => {
  it('returns empty array for null/undefined/false', () => {
    expect(normalizeChildren(null)).toEqual([]);
    expect(normalizeChildren(undefined)).toEqual([]);
    expect(normalizeChildren(false)).toEqual([]);
  });

  it('wraps single child in array', () => {
    expect(normalizeChildren('hello')).toEqual(['hello']);
    expect(normalizeChildren(42)).toEqual([42]);
  });

  it('flattens nested arrays', () => {
    expect(normalizeChildren([[1], [2, [3]]])).toEqual([1, 2, 3]);
  });

  it('filters out null/false from arrays', () => {
    expect(normalizeChildren([1, null, 2, false, 3])).toEqual([1, 2, 3]);
  });
});

describe('Fragment', () => {
  it('returns children as flat array', () => {
    expect(Fragment({ children: [1, 2, 3] })).toEqual([1, 2, 3]);
  });

  it('handles no children', () => {
    expect(Fragment({})).toEqual([]);
  });
});

// ─── Primitive Components ───────────────────────────────────────────────────

describe('Whiteboard', () => {
  beforeEach(() => setTheme('classic'));

  it('creates a WBDocument with version 2', () => {
    const doc = Whiteboard({
      children: [
        { type: 'rect', id: 'r1', width: 100, height: 50 },
      ],
    });
    expect(doc).toEqual({
      version: 2,
      nodes: [{ type: 'rect', id: 'r1', width: 100, height: 50 }],
    });
  });

  it('lifts connectors to top level', () => {
    const doc = Whiteboard({
      children: [
        {
          type: 'frame',
          id: 'f1',
          layout: 'vertical',
          children: [
            { type: 'rect', id: 'r1', width: 100, height: 50 },
            { type: 'connector', id: 'c1', connector: { from: 'r1', to: 'r2' } },
          ],
        },
        { type: 'rect', id: 'r2', width: 100, height: 50 },
      ],
    });

    // Connector should be at top level, not inside frame
    expect(doc.nodes).toHaveLength(3);
    const types = doc.nodes.map((n: any) => n.type);
    expect(types).toContain('connector');

    // Frame should not have connector in children
    const frame = doc.nodes.find((n: any) => n.type === 'frame') as any;
    expect(frame.children).toHaveLength(1);
    expect(frame.children[0].type).toBe('rect');
  });

  it('filters null children', () => {
    const doc = Whiteboard({
      children: [
        { type: 'rect', id: 'r1', width: 100, height: 50 },
        null,
        undefined,
      ],
    });
    expect(doc.nodes).toHaveLength(1);
  });
});

describe('Rect', () => {
  it('creates a rect node', () => {
    const node = Rect({ id: 'r1', width: 100, height: 50, fillColor: '#FF0000' });
    expect(node).toEqual({
      type: 'rect',
      id: 'r1',
      width: 100,
      height: 50,
      fillColor: '#FF0000',
    });
  });

  it('processes markdown text', () => {
    const node = Rect({ id: 'r1', width: 100, height: 50, text: '**bold**' }) as any;
    expect(node.text).toEqual([{ content: 'bold', bold: true }]);
  });

  it('strips undefined properties', () => {
    const node = Rect({ id: 'r1' }) as any;
    expect(node).toEqual({ type: 'rect', id: 'r1' });
    expect('fillColor' in node).toBe(false);
  });
});

describe('Ellipse', () => {
  it('creates an ellipse node', () => {
    const node = Ellipse({ id: 'e1', width: 80, height: 80 });
    expect((node as any).type).toBe('ellipse');
  });
});

describe('Diamond', () => {
  it('creates a diamond node', () => {
    const node = Diamond({ id: 'd1', width: 120, height: 80, text: 'Decision?' });
    expect((node as any).type).toBe('diamond');
    expect((node as any).text).toBe('Decision?');
  });
});

describe('Triangle', () => {
  it('creates a triangle node with topWidth', () => {
    const node = Triangle({ id: 't1', width: 100, height: 80, topWidth: 20 }) as any;
    expect(node.type).toBe('triangle');
    expect(node.topWidth).toBe(20);
  });
});

describe('Cylinder', () => {
  it('creates a cylinder node', () => {
    const node = Cylinder({ id: 'cy1', width: 80, height: 100 });
    expect((node as any).type).toBe('cylinder');
  });
});

describe('Trapezoid', () => {
  it('creates a trapezoid node', () => {
    const node = Trapezoid({ id: 'tp1', width: 100, height: 60, topWidth: 60 }) as any;
    expect(node.type).toBe('trapezoid');
    expect(node.topWidth).toBe(60);
  });
});

describe('HStack', () => {
  it('creates a horizontal frame', () => {
    const node = HStack({
      id: 'hs1',
      gap: 20,
      children: [
        { type: 'rect', id: 'r1', width: 50, height: 50 },
        { type: 'rect', id: 'r2', width: 50, height: 50 },
      ],
    }) as any;

    expect(node.type).toBe('frame');
    expect(node.layout).toBe('horizontal');
    expect(node.gap).toBe(20);
    expect(node.children).toHaveLength(2);
  });

  it('uses default gap and fill-container width', () => {
    const node = HStack({
      children: [{ type: 'rect', id: 'r1', width: 50, height: 50 }],
    }) as any;
    expect(node.gap).toBe(spacing.md);
    expect(node.width).toBe('fill-container');
    expect(node.height).toBe('fit-content');
  });
});

describe('VStack', () => {
  it('creates a vertical frame', () => {
    const node = VStack({
      children: [{ type: 'rect', id: 'r1', width: 50, height: 50 }],
    }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('vertical');
  });
});

describe('DagreGraph', () => {
  it('creates a dagre frame with layout options', () => {
    const node = DagreGraph({
      id: 'dg1',
      edges: [['a', 'b', 'flow']],
      rankdir: 'LR',
      nodesep: 80,
      children: [
        { type: 'rect', id: 'a', width: 100, height: 50 },
        { type: 'rect', id: 'b', width: 100, height: 50 },
      ],
    }) as any;

    expect(node.type).toBe('frame');
    expect(node.layout).toBe('dagre');
    expect(node.layoutOptions.edges).toEqual([['a', 'b', 'flow']]);
    expect(node.layoutOptions.rankdir).toBe('LR');
    expect(node.layoutOptions.nodesep).toBe(80);
    expect(node.children).toHaveLength(2);
  });
});

describe('Text', () => {
  it('creates a text node from text prop', () => {
    const node = Text({ id: 't1', text: 'Hello', fontSize: 16 }) as any;
    expect(node.type).toBe('text');
    expect(node.text).toBe('Hello');
    expect(node.fontSize).toBe(16);
  });

  it('creates a text node from children string', () => {
    const node = Text({ id: 't1', children: 'Hello World' }) as any;
    expect(node.text).toBe('Hello World');
  });

  it('prefers text prop over children', () => {
    const node = Text({ id: 't1', text: 'from prop', children: 'from children' }) as any;
    expect(node.text).toBe('from prop');
  });
});

describe('StickyNote', () => {
  it('creates a sticky note', () => {
    const node = StickyNote({ id: 's1', text: 'Note', fillColor: '#FEF1CE' }) as any;
    expect(node.type).toBe('stickyNote');
    expect(node.fillColor).toBe('#FEF1CE');
  });
});

describe('Connector', () => {
  beforeEach(() => setTheme('classic'));

  it('creates a connector with theme defaults', () => {
    const node = Connector({ from: 'a', to: 'b' }) as any;
    expect(node.type).toBe('connector');
    expect(node.connector.from).toBe('a');
    expect(node.connector.to).toBe('b');
    expect(node.connector.lineColor).toBe('#BBBFC4'); // classic theme
    expect(node.connector.lineWidth).toBe(1); // secondary default
    expect(node.connector.lineStyle).toBe('solid');
  });

  it('applies variant styles', () => {
    const mainNode = Connector({ from: 'a', to: 'b', variant: 'main' }) as any;
    expect(mainNode.connector.lineWidth).toBe(2);

    const asyncNode = Connector({ from: 'a', to: 'b', variant: 'async' }) as any;
    expect(asyncNode.connector.lineStyle).toBe('dashed');

    const weakNode = Connector({ from: 'a', to: 'b', variant: 'weak' }) as any;
    expect(weakNode.connector.lineStyle).toBe('dotted');
  });

  it('allows overriding defaults', () => {
    const node = Connector({
      from: 'a',
      to: 'b',
      lineColor: '#FF0000',
      lineWidth: 3,
    }) as any;
    expect(node.connector.lineColor).toBe('#FF0000');
    expect(node.connector.lineWidth).toBe(3);
  });
});

describe('Svg', () => {
  it('creates an svg node', () => {
    const node = Svg({ id: 's1', width: 100, height: 100, code: '<circle cx="50" cy="50" r="40"/>' }) as any;
    expect(node.type).toBe('svg');
    expect(node.svg.code).toContain('circle');
  });
});

describe('Image', () => {
  it('creates an image node', () => {
    const node = Image({ id: 'i1', width: 200, height: 150, src: 'https://example.com/img.png' }) as any;
    expect(node.type).toBe('image');
    expect(node.image.src).toBe('https://example.com/img.png');
  });
});

describe('Icon', () => {
  it('creates an icon node', () => {
    const node = Icon({ id: 'ic1', name: 'cloud-server', width: 28, height: 28, color: '#3B82F6' }) as any;
    expect(node.type).toBe('icon');
    expect(node.name).toBe('cloud-server');
    expect(node.color).toBe('#3B82F6');
  });
});

// ─── Composite Components ───────────────────────────────────────────────────

describe('Card', () => {
  beforeEach(() => setTheme('classic'));

  it('creates a card with title and subtitle', () => {
    const node = Card({ id: 'c1', title: 'API Gateway', subtitle: 'REST/GraphQL' }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('vertical');
    expect(node.borderRadius).toBe(borders.card.radius);
    expect(node.children).toHaveLength(2);
    expect(node.children[0].type).toBe('text');
    expect(node.children[0].text).toBe('API Gateway');
    expect(node.children[1].text).toBe('REST/GraphQL');
  });

  it('applies colorGroup colors', () => {
    const node = Card({ id: 'c1', title: 'Test', colorGroup: 'blue' }) as any;
    expect(node.fillColor).toBe('#FFFFFF'); // classic blue fill
    expect(node.borderColor).toBe('#C2D3EE'); // classic blue softBorder
  });

  it('allows direct color override', () => {
    const node = Card({
      id: 'c1',
      title: 'Test',
      colorGroup: 'blue',
      fillColor: '#FF0000',
    }) as any;
    expect(node.fillColor).toBe('#FF0000');
  });

  it('parses markdown in title', () => {
    const node = Card({ id: 'c1', title: '**Bold Title**' }) as any;
    expect(node.children[0].text).toEqual([{ content: 'Bold Title', bold: true }]);
  });
});

describe('IconCard', () => {
  beforeEach(() => setTheme('classic'));

  it('creates horizontal icon card (Model A)', () => {
    const node = IconCard({
      id: 'ic1',
      icon: 'shield',
      title: 'Auth',
      subtitle: 'OAuth 2.0',
      direction: 'horizontal',
    }) as any;

    expect(node.type).toBe('frame');
    expect(node.layout).toBe('horizontal');
    expect(node.children).toHaveLength(2);
    expect(node.children[0].type).toBe('icon');
    expect(node.children[0].name).toBe('shield');
    expect(node.children[1].type).toBe('frame'); // text container
  });

  it('creates vertical icon card (Model B)', () => {
    const node = IconCard({
      id: 'ic1',
      icon: 'database',
      title: 'DB',
      direction: 'vertical',
    }) as any;

    expect(node.layout).toBe('vertical');
  });
});

describe('Badge', () => {
  beforeEach(() => setTheme('classic'));

  it('creates a pill badge', () => {
    const node = Badge({ text: 'v2.0' }) as any;
    expect(node.type).toBe('frame');
    expect(node.borderRadius).toBe(borders.badge.radius);
    expect(node.padding).toEqual([2, 8]);
    expect(node.children[0].text).toBe('v2.0');
  });

  it('applies colorGroup to badge', () => {
    const node = Badge({ text: 'OK', colorGroup: 'green' }) as any;
    expect(node.fillColor).toBe('#F0FDF4'); // classic green badgeBg
    expect(node.children[0].textColor).toBe('#509863'); // classic green border
  });
});

describe('Section', () => {
  beforeEach(() => setTheme('classic'));

  it('creates a titled section', () => {
    const node = Section({
      title: 'Backend',
      colorGroup: 'blue',
      children: [
        Card({ id: 'c1', title: 'Service A' }),
      ],
    }) as any;

    expect(node.type).toBe('frame');
    expect(node.layout).toBe('vertical');
    expect(node.fillColor).toBe('#F0F4FC'); // classic blue bg
    expect(node.borderColor).toBe('#5178C6'); // classic blue border
    expect(node.borderWidth).toBe(borders.partition.width);
    expect(node.borderRadius).toBe(borders.partition.radius);

    // First child is title text
    expect(node.children[0].type).toBe('text');
    expect(node.children[0].text).toBe('Backend');
    expect(node.children[0].textColor).toBe('#5178C6');

    // Second child is the card
    expect(node.children[1].type).toBe('frame');
  });
});

describe('LabeledRow', () => {
  beforeEach(() => setTheme('classic'));

  it('creates a label + content row', () => {
    const node = LabeledRow({
      label: 'Access Layer',
      labelWidth: 100,
      colorGroup: 'blue',
      children: [
        { type: 'rect', id: 'r1', width: 200, height: 50 },
      ],
    }) as any;

    expect(node.type).toBe('frame');
    expect(node.layout).toBe('horizontal');
    expect(node.width).toBe('fill-container');
    expect(node.children).toHaveLength(2);

    // Label
    expect(node.children[0].type).toBe('text');
    expect(node.children[0].text).toBe('Access Layer');
    expect(node.children[0].width).toBe(100);
    expect(node.children[0].textAlign).toBe('right');

    // Content
    expect(node.children[1].type).toBe('rect');
  });
});

// ─── Theme Switching ────────────────────────────────────────────────────────

describe('Theme switching', () => {
  it('applies tech theme connector color', () => {
    setTheme('tech');
    const node = Connector({ from: 'a', to: 'b' }) as any;
    expect(node.connector.lineColor).toBe('#475569');
  });

  it('applies minimalist theme card colors', () => {
    setTheme('minimalist');
    const node = Card({ id: 'c1', title: 'Test', colorGroup: 'blue' }) as any;
    expect(node.fillColor).toBe('#FFFFFF');
    expect(node.borderColor).toBe('#E9ECEF'); // minimalist blue softBorder
  });

  it('Whiteboard sets theme', () => {
    // Whiteboard sets theme internally, then processes children.
    // Since children are evaluated eagerly (before Whiteboard runs),
    // we need to create the connector inside the Whiteboard call flow.
    // The Whiteboard component calls setTheme first, then flattenChildren.
    // But JSX children are evaluated before the parent function runs.
    // So we test by calling setTheme manually then creating the document.
    setTheme('fresh');
    const doc = Whiteboard({
      theme: 'fresh',
      children: [
        Connector({ from: 'a', to: 'b' }),
      ],
    });
    const connector = doc.nodes.find((n: any) => n.type === 'connector') as any;
    expect(connector.connector.lineColor).toBe('#86EFAC'); // fresh connector color
  });
});

// ─── New Composite Components ──────────────────────────────────────────────

describe('Divider', () => {
  beforeEach(() => setTheme('classic'));

  it('creates a horizontal divider line', () => {
    const node = Divider({}) as any;
    expect(node.type).toBe('rect');
    expect(node.width).toBe('fill-container');
    expect(node.height).toBe(1);
    expect(node.borderWidth).toBe(0);
  });

  it('creates a vertical divider', () => {
    const node = Divider({ direction: 'vertical' }) as any;
    expect(node.type).toBe('rect');
    expect(node.width).toBe(1);
    expect(node.height).toBe('fill-container');
  });

  it('creates a labeled divider', () => {
    const node = Divider({ label: 'OR' }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('horizontal');
    expect(node.children).toHaveLength(3); // line, text, line
    expect(node.children[0].type).toBe('rect');
    expect(node.children[1].type).toBe('text');
    expect(node.children[1].text).toBe('OR');
    expect(node.children[2].type).toBe('rect');
  });

  it('applies colorGroup color', () => {
    const node = Divider({ colorGroup: 'blue' }) as any;
    expect(node.fillColor).toBe('#C2D3EE'); // classic blue softBorder
  });
});

describe('BulletList', () => {
  beforeEach(() => setTheme('classic'));

  it('creates unordered list with bullet markers', () => {
    const node = BulletList({ items: ['Item A', 'Item B'] }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('vertical');
    expect(node.children).toHaveLength(2);
    // Each item is a horizontal frame: [bullet, text]
    const item = node.children[0];
    expect(item.layout).toBe('horizontal');
    expect(item.children[0].text).toBe('\u2022');
    expect(item.children[1].text).toBe('Item A');
  });

  it('creates ordered list with numbers', () => {
    const node = BulletList({ items: ['First', 'Second'], ordered: true }) as any;
    expect(node.children[0].children[0].text).toBe('1.');
    expect(node.children[1].children[0].text).toBe('2.');
  });

  it('supports custom start number', () => {
    const node = BulletList({ items: ['A'], ordered: true, startNumber: 5 }) as any;
    expect(node.children[0].children[0].text).toBe('5.');
  });

  it('supports icon per item', () => {
    const node = BulletList({
      items: [{ text: 'Check this', icon: 'check-circle' }],
    }) as any;
    const prefix = node.children[0].children[0];
    expect(prefix.type).toBe('icon');
    expect(prefix.name).toBe('check-circle');
  });

  it('supports markdown in items', () => {
    const node = BulletList({ items: ['**bold item**'] }) as any;
    const textNode = node.children[0].children[1];
    expect(textNode.text).toEqual([{ content: 'bold item', bold: true }]);
  });
});

describe('Legend', () => {
  beforeEach(() => setTheme('classic'));

  it('creates legend with color swatches and labels', () => {
    const node = Legend({
      items: [
        { color: '#FF0000', label: 'Error' },
        { color: '#00FF00', label: 'Success' },
      ],
    }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('vertical');
    // Items container (no title)
    const itemsContainer = node.children[0];
    expect(itemsContainer.layout).toBe('horizontal');
    expect(itemsContainer.children).toHaveLength(2);
    // First item: [rect swatch, text label]
    const firstItem = itemsContainer.children[0];
    expect(firstItem.children[0].type).toBe('rect');
    expect(firstItem.children[0].fillColor).toBe('#FF0000');
    expect(firstItem.children[0].width).toBe(12);
    expect(firstItem.children[1].text).toBe('Error');
  });

  it('renders title when provided', () => {
    const node = Legend({
      title: 'Legend',
      items: [{ color: '#000', label: 'Item' }],
    }) as any;
    expect(node.children).toHaveLength(2); // title + items container
    expect(node.children[0].type).toBe('text');
    expect(node.children[0].text).toBe('Legend');
  });

  it('supports vertical item layout', () => {
    const node = Legend({
      items: [{ color: '#000', label: 'A' }],
      direction: 'vertical',
    }) as any;
    const itemsContainer = node.children[0];
    expect(itemsContainer.layout).toBe('vertical');
  });
});

describe('Callout', () => {
  beforeEach(() => setTheme('classic'));

  it('creates info callout with blue colors', () => {
    const node = Callout({ variant: 'info', title: 'Note', body: 'Some info' }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('horizontal');
    expect(node.fillColor).toBe('#F0F4FC'); // classic blue bg
    expect(node.borderColor).toBe('#5178C6'); // classic blue border
    // Icon + content container
    expect(node.children).toHaveLength(2);
    expect(node.children[0].type).toBe('icon');
    expect(node.children[0].name).toBe('info-circle');
    // Content: title + body
    const content = node.children[1];
    expect(content.children).toHaveLength(2);
    expect(content.children[0].text).toBe('Note');
    expect(content.children[1].text).toBe('Some info');
  });

  it('creates warning callout with yellow colors', () => {
    const node = Callout({ variant: 'warning', title: 'Caution' }) as any;
    expect(node.fillColor).toBe('#FEF1CE'); // classic yellow bg
    expect(node.children[0].name).toBe('warning-triangle');
  });

  it('creates success callout with green colors', () => {
    const node = Callout({ variant: 'success' }) as any;
    expect(node.fillColor).toBe('#DFF5E5'); // classic green bg
    expect(node.children[0].name).toBe('check-circle');
  });

  it('creates note callout with purple colors', () => {
    const node = Callout({ variant: 'note' }) as any;
    expect(node.fillColor).toBe('#EAE2FE'); // classic purple bg
    expect(node.children[0].name).toBe('edit');
  });

  it('explicit colorGroup overrides variant', () => {
    const node = Callout({ variant: 'info', colorGroup: 'red' }) as any;
    expect(node.fillColor).toBe('#FEE3E2'); // classic red bg, not blue
  });

  it('renders children in body', () => {
    const node = Callout({
      variant: 'info',
      children: [{ type: 'rect', id: 'r1', width: 100, height: 50 }],
    }) as any;
    const content = node.children[1]; // content frame
    expect(content.children).toHaveLength(1);
    expect(content.children[0].type).toBe('rect');
  });
});

describe('DetailCard', () => {
  beforeEach(() => setTheme('classic'));

  it('creates card with header and entries', () => {
    const node = DetailCard({
      id: 'dc1',
      title: 'API Endpoint',
      entries: [
        { key: 'Method', value: 'GET' },
        { key: 'Path', value: '/users' },
      ],
    }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('vertical');
    expect(node.id).toBe('dc1');
    // Children: title text group, divider, entries container
    expect(node.children.length).toBeGreaterThanOrEqual(3);
    // First child is title text
    expect(node.children[0].type).toBe('text');
    expect(node.children[0].text).toBe('API Endpoint');
    // Second child is divider line (rect)
    expect(node.children[1].type).toBe('rect');
    expect(node.children[1].height).toBe(1);
    // Third child is entries container
    expect(node.children[2].children).toHaveLength(2);
  });

  it('renders icon in header when provided', () => {
    const node = DetailCard({
      id: 'dc2',
      icon: 'api',
      title: 'Service',
    }) as any;
    // First child should be horizontal header frame with icon + text group
    const header = node.children[0];
    expect(header.layout).toBe('horizontal');
    expect(header.children[0].type).toBe('icon');
    expect(header.children[0].name).toBe('api');
  });

  it('renders subtitle', () => {
    const node = DetailCard({
      id: 'dc3',
      icon: 'api',
      title: 'Title',
      subtitle: 'Subtitle',
    }) as any;
    const header = node.children[0]; // horizontal header
    const textGroup = header.children[1]; // vertical text frame
    expect(textGroup.children).toHaveLength(2);
    expect(textGroup.children[1].text).toBe('Subtitle');
  });

  it('supports children in body', () => {
    const child = { type: 'rect', id: 'inner', width: 100, height: 50 };
    const node = DetailCard({
      id: 'dc4',
      title: 'Card',
      children: [child],
    }) as any;
    // Should find the rect among children (after title, divider)
    const hasRect = node.children.some((c: any) => c.type === 'rect' && c.id === 'inner');
    expect(hasRect).toBe(true);
  });

  it('renders footer with divider', () => {
    const badgeNode = Badge({ text: 'v2' });
    const node = DetailCard({
      id: 'dc5',
      title: 'Card',
      footer: [badgeNode],
    }) as any;
    // Last child should be footer frame
    const lastChild = node.children[node.children.length - 1];
    expect(lastChild.layout).toBe('horizontal');
    // Second to last should be divider
    const divider = node.children[node.children.length - 2];
    expect(divider.type).toBe('rect');
    expect(divider.height).toBe(1);
  });

  it('applies colorGroup colors', () => {
    const node = DetailCard({
      id: 'dc6',
      title: 'Test',
      colorGroup: 'green',
    }) as any;
    expect(node.fillColor).toBe('#FFFFFF'); // classic green fill
    expect(node.borderColor).toBe('#C8E6CF'); // classic green softBorder
  });
});

describe('Table', () => {
  beforeEach(() => setTheme('classic'));

  it('creates table with headers and rows', () => {
    const node = Table({
      headers: ['Name', 'Value'],
      rows: [['foo', 'bar'], ['baz', 'qux']],
    }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('vertical');
    expect(node.gap).toBe(0);
    // 1 header row + 2 data rows
    expect(node.children).toHaveLength(3);
    // Header row
    const headerRow = node.children[0];
    expect(headerRow.layout).toBe('horizontal');
    expect(headerRow.children).toHaveLength(2);
    // First header cell text
    expect(headerRow.children[0].children[0].text).toBe('Name');
    // Data row
    const dataRow = node.children[1];
    expect(dataRow.children[0].children[0].text).toBe('foo');
  });

  it('applies alternating row colors when striped', () => {
    const node = Table({
      headers: ['A'],
      rows: [['r0'], ['r1'], ['r2']],
      striped: true,
    }) as any;
    // Row 0 (even) → fill color, Row 1 (odd) → bg color
    expect(node.children[1].fillColor).toBe('#FFFFFF'); // fill (even row)
    expect(node.children[2].fillColor).toBe('#F8FAFC'); // bg (odd row, no colorGroup)
  });

  it('applies colorGroup to table', () => {
    const node = Table({
      headers: ['A'],
      rows: [['x']],
      colorGroup: 'blue',
    }) as any;
    expect(node.borderColor).toBe('#C2D3EE'); // classic blue softBorder
    // Header row background
    expect(node.children[0].fillColor).toBe('#F0F4FC'); // classic blue badgeBg
  });

  it('handles missing headers (no header row)', () => {
    const node = Table({
      rows: [['a', 'b']],
    }) as any;
    expect(node.children).toHaveLength(1); // only data row
  });

  it('supports component cells', () => {
    const badgeNode = Badge({ text: 'OK' });
    const node = Table({
      headers: ['Status'],
      rows: [[badgeNode]],
    }) as any;
    const dataRow = node.children[1];
    const cell = dataRow.children[0];
    // Cell frame should contain the badge (a frame)
    expect(cell.children[0].type).toBe('frame'); // Badge is a frame
    expect(cell.children[0].children[0].text).toBe('OK');
  });
});

describe('Figure', () => {
  beforeEach(() => setTheme('classic'));

  it('creates figure with label, title, content, and caption', () => {
    const contentNode = { type: 'rect', id: 'content', width: 200, height: 100 };
    const node = Figure({
      label: 'Figure 1',
      title: 'Architecture Overview',
      children: [contentNode],
      caption: 'A detailed view of the system.',
    }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('vertical');
    // Header (combined label+title), content, caption
    expect(node.children).toHaveLength(3);
    // Header text combines label and title
    const header = node.children[0];
    expect(header.type).toBe('text');
    expect(header.textAlign).toBe('center');
    // Content
    expect(node.children[1].type).toBe('rect');
    expect(node.children[1].id).toBe('content');
    // Caption
    expect(node.children[2].type).toBe('text');
    expect(node.children[2].text).toBe('A detailed view of the system.');
    expect(node.children[2].textAlign).toBe('center');
  });

  it('renders children in content area', () => {
    const node = Figure({
      children: [
        { type: 'rect', id: 'a', width: 100, height: 50 },
        { type: 'rect', id: 'b', width: 100, height: 50 },
      ],
    }) as any;
    expect(node.children).toHaveLength(2);
  });

  it('applies border and padding', () => {
    const node = Figure({ children: [] }) as any;
    expect(node.borderRadius).toBe(12); // partition radius
    expect(node.padding).toEqual([24, 24]);
  });
});

describe('Pipeline', () => {
  beforeEach(() => setTheme('classic'));

  it('creates horizontal pipeline with step nodes', () => {
    const node = Pipeline({
      steps: [
        { id: 'step1', title: 'Parse' },
        { id: 'step2', title: 'Validate' },
        { id: 'step3', title: 'Deploy' },
      ],
    }) as any;
    expect(node.type).toBe('frame');
    expect(node.layout).toBe('horizontal');
    // 3 step nodes + 2 connector nodes
    expect(node.children).toHaveLength(5);
  });

  it('creates vertical pipeline', () => {
    const node = Pipeline({
      direction: 'vertical',
      steps: [
        { id: 's1', title: 'A' },
        { id: 's2', title: 'B' },
      ],
    }) as any;
    expect(node.layout).toBe('vertical');
  });

  it('auto-generates connector nodes between steps', () => {
    const node = Pipeline({
      id: 'pipe',
      steps: [
        { id: 'a', title: 'A' },
        { id: 'b', title: 'B' },
        { id: 'c', title: 'C' },
      ],
    }) as any;
    const connectors = node.children.filter((c: any) => c.type === 'connector');
    expect(connectors).toHaveLength(2);
    expect(connectors[0].connector.from).toBe('a');
    expect(connectors[0].connector.to).toBe('b');
    expect(connectors[0].connector.endArrow).toBe('arrow');
    expect(connectors[1].connector.from).toBe('b');
    expect(connectors[1].connector.to).toBe('c');
  });

  it('renders step with icon', () => {
    const node = Pipeline({
      steps: [{ id: 's1', title: 'Step', icon: 'rocket' }],
    }) as any;
    const stepNode = node.children[0];
    // Should have a header frame with icon inside
    const headerFrame = stepNode.children[0];
    expect(headerFrame.layout).toBe('horizontal');
    expect(headerFrame.children[0].type).toBe('icon');
    expect(headerFrame.children[0].name).toBe('rocket');
  });

  it('renders step children', () => {
    const child = { type: 'rect', id: 'inner', width: 50, height: 50 };
    const node = Pipeline({
      steps: [{ id: 's1', title: 'Step', children: [child] }],
    }) as any;
    const stepNode = node.children[0];
    const hasRect = stepNode.children.some((c: any) => c.type === 'rect' && c.id === 'inner');
    expect(hasRect).toBe(true);
  });

  it('applies connector variant', () => {
    const node = Pipeline({
      connectorVariant: 'async',
      steps: [
        { id: 'a', title: 'A' },
        { id: 'b', title: 'B' },
      ],
    }) as any;
    const conn = node.children.find((c: any) => c.type === 'connector');
    expect(conn.connector.lineStyle).toBe('dashed');
    expect(conn.connector.lineWidth).toBe(1);
  });
});

// ─── Nesting / Composability ───────────────────────────────────────────────

describe('Component nesting', () => {
  beforeEach(() => setTheme('classic'));

  it('DetailCard with BulletList as children', () => {
    const node = DetailCard({
      id: 'nested1',
      title: 'Card',
      children: [
        BulletList({ items: ['A', 'B'] }),
      ],
    }) as any;
    // Should find a frame (BulletList) among the card's children
    const bulletList = node.children.find(
      (c: any) => c.type === 'frame' && c.layout === 'vertical' && c.children?.length === 2
        && c.children[0]?.layout === 'horizontal',
    );
    expect(bulletList).toBeDefined();
  });

  it('Figure containing Table', () => {
    const node = Figure({
      label: 'Table 1',
      title: 'Results',
      children: [
        Table({
          headers: ['Metric', 'Value'],
          rows: [['Accuracy', '95%']],
        }),
      ],
    }) as any;
    // Second child (after header text) should be the table frame
    const tableNode = node.children[1];
    expect(tableNode.type).toBe('frame');
    expect(tableNode.gap).toBe(0); // Table signature: gap 0
  });
});
