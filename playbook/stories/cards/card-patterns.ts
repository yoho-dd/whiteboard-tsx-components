import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, HStack, Text } from '../../../src/primitives.js';
import { Badge, Card, IconCard, Section } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'cards-card-patterns',
  category: 'Cards',
  title: '基础卡片模式',
  description: '覆盖 Card、IconCard、Badge 的常见样式组合，方便观察标题、副标题、图标和状态标签。',
  render: () => {
    setTheme('classic');

    return Whiteboard({
      theme: 'classic',
      children: [
        VStack({
          id: 'root',
          width: 1160,
          gap: spacing.lg,
          padding: spacing.xl,
          fillColor: '#F8FAFC',
          children: [
            Text({
              id: 'title',
              text: 'Card Patterns',
              fontSize: typography.h1.fontSize,
              textColor: '#1F2329',
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'icon-cards',
              title: 'Icon Cards',
              colorGroup: 'blue',
              children: [
                HStack({
                  gap: spacing.md,
                  children: [
                    IconCard({ id: 'api', icon: 'api', title: '**API Gateway**', subtitle: 'REST / GraphQL', colorGroup: 'blue' }),
                    IconCard({ id: 'auth', icon: 'shield', title: '**Auth Service**', subtitle: 'OIDC / SSO', colorGroup: 'green' }),
                    IconCard({ id: 'queue', icon: 'send', title: '**Event Bus**', subtitle: 'Kafka / Retry', colorGroup: 'yellow' }),
                  ],
                }),
              ],
            }),
            Section({
              id: 'cards',
              title: 'Cards with Status',
              colorGroup: 'purple',
              children: [
                HStack({
                  gap: spacing.md,
                  alignItems: 'stretch',
                  children: [
                    Card({
                      id: 'svc-a',
                      title: '**Inventory API**',
                      subtitle: 'SLO 99.95%',
                      colorGroup: 'purple',
                      children: [Badge({ text: 'stable', colorGroup: 'green' })],
                    }),
                    Card({
                      id: 'svc-b',
                      title: '**Search Indexer**',
                      subtitle: 'Rebuild in progress',
                      colorGroup: 'purple',
                      children: [Badge({ text: 'warming', colorGroup: 'yellow' })],
                    }),
                    Card({
                      id: 'svc-c',
                      title: '**Payment Adapter**',
                      subtitle: 'External dependency',
                      colorGroup: 'purple',
                      children: [Badge({ text: 'risk', colorGroup: 'red' })],
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
