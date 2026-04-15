import type { PlaybookStory } from '../../types.js';
import { setTheme } from '../../../src/theme.js';
import { Whiteboard, DagreGraph, Rect } from '../../../src/primitives.js';
import { IconCard } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'flow-dagre-auto-layout',
  category: 'Flow',
  title: 'Dagre 自动布局流程图',
  description: '展示 DagreGraph 自动布局能力，适合预览流程图、依赖图的方向、节点间距和分支关系。',
  render: () => {
    setTheme('tech');

    return Whiteboard({
      theme: 'tech',
      children: [
        DagreGraph({
          id: 'dagre-root',
          width: 1100,
          height: 'fit-content',
          rankdir: 'LR',
          nodesep: 56,
          ranksep: 110,
          edges: [
            ['ingest', 'parse', 'flow'],
            ['parse', 'classify', 'flow'],
            ['classify', 'route-a', 'ok'],
            ['classify', 'route-b', 'fallback'],
            ['route-a', 'persist', 'save'],
            ['route-b', 'persist', 'save'],
            ['persist', 'notify', 'done'],
          ],
          children: [
            IconCard({
              id: 'ingest',
              width: 220,
              icon: 'download',
              title: '**Ingest**',
              subtitle: 'Webhook / Queue',
              colorGroup: 'blue',
            }),
            Rect({ id: 'parse', width: 180, height: 88, text: '**Parse**\nNormalize payload', fillColor: '#FFFFFF', borderColor: '#2563EB' }),
            IconCard({
              id: 'classify',
              width: 230,
              icon: 'sparkles',
              title: '**Classify**',
              subtitle: 'Rules + AI',
              colorGroup: 'green',
            }),
            Rect({ id: 'route-a', width: 180, height: 88, text: '**Route A**\nPrimary pipeline', fillColor: '#FFFFFF', borderColor: '#7C3AED' }),
            Rect({ id: 'route-b', width: 180, height: 88, text: '**Route B**\nFallback pipeline', fillColor: '#FFFFFF', borderColor: '#F59E0B' }),
            IconCard({
              id: 'persist',
              width: 220,
              icon: 'database',
              title: '**Persist**',
              subtitle: 'Write results',
              colorGroup: 'red',
            }),
            IconCard({
              id: 'notify',
              width: 220,
              icon: 'send',
              title: '**Notify**',
              subtitle: 'Callback / Event',
              colorGroup: 'blue',
            }),
          ],
        }),
      ],
    });
  },
};

export default story;
