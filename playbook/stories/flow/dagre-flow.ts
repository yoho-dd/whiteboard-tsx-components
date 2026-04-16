import type { PlaybookStory } from '../../types.js';
import { setTheme, getTheme, typography } from '../../../src/theme.js';
import { Whiteboard, DagreGraph } from '../../../src/primitives.js';
import { IconCard, Card } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'flow-dagre-auto-layout',
  category: 'Flow',
  title: 'Dagre 自动布局流程图',
  description: '展示 DagreGraph 自动布局能力，适合预览复杂的任务流、依赖图或决策树。',
  render: () => {
    setTheme('tech');
    const theme = getTheme();

    return Whiteboard({
      theme: 'tech',
      children: [
        DagreGraph({
          id: 'dagre-root',
          width: 'fit-content',
          height: 'fit-content',
          rankdir: 'LR',
          nodesep: 60,
          ranksep: 120,
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
              width: 240,
              icon: 'download',
              title: '**Ingest**',
              subtitle: 'Data Ingestion Layer',
              colorGroup: 'blue',
            }),
            Card({
              id: 'parse',
              width: 200,
              title: '**Parse**',
              subtitle: 'JSON Schema Validation',
              colorGroup: 'blue',
            }),
            IconCard({
              id: 'classify',
              width: 240,
              icon: 'sparkles',
              title: '**Classify**',
              subtitle: 'AI Engine Categorization',
              colorGroup: 'green',
            }),
            Card({
              id: 'route-a',
              width: 200,
              title: '**Route A**',
              subtitle: 'Standard Pipeline',
              colorGroup: 'purple',
            }),
            Card({
              id: 'route-b',
              width: 200,
              title: '**Route B**',
              subtitle: 'Fallback / Retry',
              colorGroup: 'yellow',
            }),
            IconCard({
              id: 'persist',
              width: 240,
              icon: 'database',
              title: '**Persist**',
              subtitle: 'OLAP / Data Lake',
              colorGroup: 'red',
            }),
            IconCard({
              id: 'notify',
              width: 240,
              icon: 'send',
              title: '**Notify**',
              subtitle: 'Event Grid Notification',
              colorGroup: 'blue',
            }),
          ],
        }),
      ],
    });
  },
};

export default story;
