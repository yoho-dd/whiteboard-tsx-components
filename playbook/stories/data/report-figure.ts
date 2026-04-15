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
    setTheme('minimalist');

    return Whiteboard({
      theme: 'minimalist',
      children: [
        VStack({
          id: 'root',
          width: 1180,
          gap: spacing.lg,
          padding: spacing.xl,
          fillColor: '#FAFBFC',
          children: [
            Text({
              id: 'title',
              text: 'Weekly Release Report',
              fontSize: typography.h1.fontSize,
              textColor: '#111827',
              width: 'fit-content',
              height: 'fit-content',
            }),
            Figure({
              id: 'figure-1',
              label: 'Figure 1',
              title: '发布健康度与告警分布',
              caption: 'Table 与 Legend 组合展示发布质量摘要，便于在文档中复用。',
              colorGroup: 'blue',
              children: [
                Section({
                  id: 'figure-content',
                  title: 'Release Snapshot',
                  colorGroup: 'blue',
                  children: [
                    HStack({
                      gap: spacing.md,
                      alignItems: 'start',
                      children: [
                        Table({
                          id: 'release-table',
                          colorGroup: 'blue',
                          headers: ['服务', '状态', '耗时', '告警'],
                          columnWidths: [220, 140, 120, 'fill'],
                          rows: [
                            ['Trade API', Badge({ text: 'success', colorGroup: 'green' }), '4m 10s', '0'],
                            ['Search API', Badge({ text: 'warning', colorGroup: 'yellow' }), '8m 30s', '2'],
                            ['Coupon Job', Badge({ text: 'success', colorGroup: 'green' }), '5m 02s', '1'],
                            ['Sync Worker', Badge({ text: 'risk', colorGroup: 'red' }), '12m 55s', '5'],
                          ],
                        }),
                        Legend({
                          id: 'legend',
                          title: '状态说明',
                          direction: 'vertical',
                          colorGroup: 'purple',
                          items: [
                            { color: '#16A34A', label: 'success: 发布正常' },
                            { color: '#F59E0B', label: 'warning: 需要关注' },
                            { color: '#DC2626', label: 'risk: 存在阻塞' },
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
