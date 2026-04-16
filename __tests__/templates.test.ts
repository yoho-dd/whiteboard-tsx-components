import { beforeEach, describe, expect, it } from 'vitest';
import { Card, BulletList, Callout } from '../src/composites.js';
import { Diamond, Frame } from '../src/primitives.js';
import { setTheme } from '../src/theme.js';
import {
  ArchitectureTemplate,
  ComparisonTemplate,
  FlowchartTemplate,
  OrganizationChartTemplate,
  SwimlaneTemplate,
} from '../src/templates.js';

describe('Template layer', () => {
  beforeEach(() => setTheme('classic'));

  it('renders architecture layers with nested subgraphs', () => {
    const node = ArchitectureTemplate({
      id: 'arch-template',
      title: 'Architecture',
      layers: [
        {
          id: 'layer-a',
          title: 'Access',
          label: '入口',
          colorGroup: 'blue',
          nodes: [
            { id: 'gateway-node', title: 'Gateway' },
            {
              id: 'service-node',
              component: Card({ id: 'service-shell', title: 'Service' }),
              children: [
                FlowchartTemplate({
                  id: 'service-flow',
                  title: 'Inner Flow',
                  nodes: [
                    { id: 'flow-a', title: 'A' },
                    { id: 'flow-b', title: 'B' },
                  ],
                  edges: [['flow-a', 'flow-b']],
                }),
              ],
            },
          ],
        },
      ],
    }) as any;

    expect(node.type).toBe('frame');
    expect(node.layout).toBe('vertical');
    expect(node.children[0].type).toBe('text');
    const section = node.children.find((child: any) => child.id === 'layer-a');
    expect(section).toBeDefined();
  });

  it('renders organization chart as a dagre graph', () => {
    const node = OrganizationChartTemplate({
      id: 'org-template',
      title: 'Org',
      nodes: [
        {
          id: 'root',
          title: 'Root',
          childrenNodes: [
            { id: 'child-a', title: 'Child A' },
            { id: 'child-b', title: 'Child B' },
          ],
        },
      ],
    }) as any;

    const graph = node.children[1];
    expect(graph.layout).toBe('dagre');
    expect(graph.layoutOptions.edges).toEqual([
      ['root', 'child-a'],
      ['root', 'child-b'],
    ]);
    expect(graph.children).toHaveLength(3);
  });

  it('renders swimlanes and keeps cross-lane connectors', () => {
    const node = SwimlaneTemplate({
      id: 'swimlane-template',
      title: 'Swimlane',
      lanes: [
        {
          id: 'lane-a',
          title: '用户',
          steps: [{ id: 'step-a', title: '提交' }],
        },
        {
          id: 'lane-b',
          title: '系统',
          steps: [{ id: 'step-b', title: '处理', component: Card({ id: 'step-b-card', title: '处理' }) }],
        },
      ],
      connectors: [
        { id: 'lane-conn', from: 'step-a', to: 'step-b', endArrow: 'arrow' },
      ],
    }) as any;

    const lanes = node.children.find((child: any) => child.id === 'swimlane-template-lanes');
    const connector = node.children.find((child: any) => child.id === 'lane-conn');
    expect(lanes).toBeDefined();
    expect(lanes.children).toHaveLength(2);
    expect(connector.type).toBe('connector');
    expect(connector.connector.from).toBe('step-a');
  });

  it('renders comparison columns with nested content', () => {
    const node = ComparisonTemplate({
      id: 'comparison-template',
      title: 'Compare',
      columns: [
        {
          id: 'left',
          title: 'Left',
          items: BulletList({ items: ['A', 'B'] }),
        },
        {
          id: 'right',
          title: 'Right',
          component: Card({ id: 'right-shell', title: 'Right shell' }),
          children: [Callout({ title: 'Note', body: 'Nested content' })],
        },
      ],
    }) as any;

    const columns = node.children.find((child: any) => child.id === 'comparison-template-columns');
    expect(columns.children).toHaveLength(2);
    expect(columns.children[0].id).toBe('left');
    expect(columns.children[1].id).toBe('right');
  });

  it('renders flowchart nodes and edges through dagre', () => {
    const node = FlowchartTemplate({
      id: 'flowchart-template',
      title: 'Flowchart',
      nodes: [
        { id: 'draft', title: 'Draft', component: Card({ id: 'draft-card', title: 'Draft' }) },
        { id: 'review', title: 'Review?', shape: 'diamond' },
        { id: 'release', title: 'Release', component: Card({ id: 'release-card', title: 'Nested' }) },
      ],
      edges: [['draft', 'review'], ['review', 'release']],
    }) as any;

    const graph = node.children[1];
    expect(graph.layout).toBe('dagre');
    expect(graph.layoutOptions.edges).toEqual([
      ['draft', 'review'],
      ['review', 'release'],
    ]);
    expect(graph.children.map((child: any) => child.id)).toEqual(['draft', 'review', 'release']);
  });

  it('uses intrinsic width for default template nodes', () => {
    const node = ComparisonTemplate({
      id: 'comparison-template',
      columns: [
        {
          id: 'left',
          title: 'Left',
          component: Card({ id: 'left-shell', title: 'Left shell' }),
          items: BulletList({ items: ['A'] }),
        },
      ],
    }) as any;

    const columns = node.children[0];
    const leftSection = columns.children[0];
    expect(leftSection.children[1].width).toBe('fit-content(220)');
  });

  it('rejects shaped template nodes with nested children', () => {
    expect(() => FlowchartTemplate({
      id: 'flowchart-template',
      nodes: [
        {
          id: 'release',
          title: 'Release',
          shape: 'rect',
          children: [Card({ id: 'release-card', title: 'Nested' })],
        },
      ],
      edges: [],
    })).toThrow(/shapes are leaf nodes/i);
  });

  it('allows frame shells to compose leaf shapes with nested helper content', () => {
    const node = FlowchartTemplate({
      id: 'flowchart-template',
      nodes: [
        {
          id: 'review',
          component: Frame({
            id: 'review-shell',
            layout: 'vertical',
            width: 'fit-content(220)',
            height: 'fit-content',
            children: [
              Diamond({ id: 'review-decision', width: 180, height: 96, text: 'Review?' }),
            ],
          }),
          children: [Callout({ title: 'Note', body: 'Escalate risky changes.' })],
        },
      ],
      edges: [],
    }) as any;

    const graph = node.children[0];
    const reviewNode = graph.children[0];
    expect(reviewNode.id).toBe('review');
    expect(reviewNode.type).toBe('frame');
    expect(reviewNode.children).toHaveLength(2);
    expect(reviewNode.children[0].id).toBe('review-decision');
    expect(reviewNode.children[0].type).toBe('diamond');
  });
});
