import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, HStack, Text } from '../../../src/primitives.js';
import { Badge, Figure, Legend, Section, Table } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'data-report-figure',
  category: 'Data',
  title: '图表包装与数据表',
  description: '把 Figure、Legend、Table 放在同一个报告视图里，适合做文档截图和数据说明。',
  render: () => {
    setTheme('business');
    const theme = getTheme();

    return Whiteboard({
      theme: 'business',
      children: [
        VStack({
          id: 'root',
          width: 1200,
          gap: spacing.xl,
          padding: spacing.xxl,
          fillColor: theme.canvas,
          children: [
            Text({
              id: 'title',
              text: '**Weekly Release Insights**',
              fontSize: typography.h1.fontSize,
              textColor: theme.text.primary,
              width: 'fit-content',
              height: 'fit-content',
            }),
            Figure({
              id: 'figure-1',
              label: 'Report A',
              title: 'Health Metrics & Alert Distribution',
              caption: 'Summary of release quality and performance across core services.',
              colorGroup: 'blue',
              children: [
                Section({
                  id: 'figure-content',
                  title: 'Production Snapshot',
                  colorGroup: 'blue',
                  children: [
                    HStack({
                      gap: spacing.lg,
                      alignItems: 'start',
                      children: [
                        Table({
                          id: 'release-table',
                          colorGroup: 'blue',
                          headers: ['Service', 'Status', 'Latency', 'Alerts'],
                          columnWidths: [240, 160, 140, 'fill'],
                          rows: [
                            ['Trade Gateway', Badge({ text: 'Healthy', colorGroup: 'green' }), '124ms', '0'],
                            ['Search Indexer', Badge({ text: 'Warning', colorGroup: 'yellow' }), '842ms', '2'],
                            ['Coupon Engine', Badge({ text: 'Healthy', colorGroup: 'green' }), '45ms', '0'],
                            ['Sync Worker', Badge({ text: 'Critical', colorGroup: 'red' }), '2.4s', '15'],
                          ],
                        }),
                        Legend({
                          id: 'legend',
                          title: 'Status Key',
                          direction: 'vertical',
                          colorGroup: 'purple',
                          items: [
                            { color: theme.groups.green.border, label: 'Healthy: No issues' },
                            { color: theme.groups.yellow.border, label: 'Warning: High latency' },
                            { color: theme.groups.red.border, label: 'Critical: Action required' },
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
};

export default story;
