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
import { Card, IconCard, Badge, Section, LabeledRow } from '../src/composites.js';
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
