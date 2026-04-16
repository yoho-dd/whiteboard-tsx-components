import type { PlaybookStory } from '../../types.js';
import { setTheme, getTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, HStack, Text } from '../../../src/primitives.js';
import { Card, Divider, LabeledRow, Section } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'layout-labeled-rows',
  category: 'Layout',
  title: '标签行布局',
  description: '展示 LabeledRow、Divider 与 Section 的组合，适合做分层说明、模块分组和对齐检查。',
  render: () => {
    setTheme('minimalist');
    const theme = getTheme();

    return Whiteboard({
      theme: 'minimalist',
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
              text: '**Platform Capabilities & Layers**',
              fontSize: typography.h1.fontSize,
              textColor: theme.text.primary,
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'layout-demo',
              title: 'Functional Segmentation',
              colorGroup: 'blue',
              children: [
                LabeledRow({
                  id: 'row-access',
                  label: 'Access',
                  labelWidth: 100,
                  colorGroup: 'blue',
                  children: [
                    HStack({
                      gap: spacing.lg,
                      children: [
                        Card({ id: 'ingress', title: '**Ingress**', subtitle: 'TLS / Traffic Routing' }),
                        Card({ id: 'gateway', title: '**API Gateway**', subtitle: 'Auth / Rate Limiting' }),
                      ],
                    }),
                  ],
                }),
                Divider({ label: 'Business Domains', colorGroup: 'blue' }),
                LabeledRow({
                  id: 'row-core',
                  label: 'Core',
                  labelWidth: 100,
                  colorGroup: 'green',
                  children: [
                    HStack({
                      gap: spacing.lg,
                      children: [
                        Card({ id: 'trade', title: '**Trade**', subtitle: 'Order & Fulfillment', colorGroup: 'green' }),
                        Card({ id: 'member', title: '**Member**', subtitle: 'Identity & Growth', colorGroup: 'green' }),
                        Card({ id: 'search', title: '**Search**', subtitle: 'Discovery & Ranking', colorGroup: 'green' }),
                      ],
                    }),
                  ],
                }),
                Divider({ label: 'Shared Infrastructure', colorGroup: 'blue' }),
                LabeledRow({
                  id: 'row-support',
                  label: 'Support',
                  labelWidth: 100,
                  colorGroup: 'purple',
                  children: [
                    HStack({
                      gap: spacing.lg,
                      children: [
                        Card({ id: 'config', title: '**Config**', subtitle: 'Dynamic Management', colorGroup: 'purple' }),
                        Card({ id: 'metrics', title: '**Observability**', subtitle: 'Logs & Metrics', colorGroup: 'purple' }),
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
