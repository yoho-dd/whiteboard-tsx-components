import type { PlaybookStory } from '../../types.js';
import { setTheme, getTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, HStack, Text } from '../../../src/primitives.js';
import { Badge, Card, IconCard, Section, DetailCard, BulletList } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'cards-card-patterns',
  category: 'Cards',
  title: '卡片设计模式',
  description: '覆盖 Card、IconCard、DetailCard 的常见样式组合，展示如何利用复合组件构建复杂信息单元。',
  render: () => {
    setTheme('fresh');
    const theme = getTheme();

    return Whiteboard({
      theme: 'fresh',
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
              text: '**Card Design Patterns**',
              fontSize: typography.h1.fontSize,
              textColor: theme.text.primary,
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'icon-cards',
              title: 'Icon Cards (Horizontal & Vertical)',
              colorGroup: 'blue',
              children: [
                HStack({
                  gap: spacing.lg,
                  children: [
                    IconCard({ 
                      id: 'api-h', 
                      icon: 'api', 
                      title: '**API Gateway**', 
                      subtitle: 'Model A: Horizontal Layout', 
                      direction: 'horizontal',
                      colorGroup: 'blue' 
                    }),
                    IconCard({ 
                      id: 'auth-v', 
                      icon: 'shield', 
                      title: '**Security**', 
                      subtitle: 'Model B: Vertical Layout', 
                      direction: 'vertical',
                      colorGroup: 'green' 
                    }),
                  ],
                }),
              ],
            }),
            Section({
              id: 'detail-cards',
              title: 'Rich Information (DetailCard)',
              colorGroup: 'purple',
              children: [
                HStack({
                  gap: spacing.lg,
                  alignItems: 'stretch',
                  children: [
                    DetailCard({
                      id: 'svc-detail',
                      icon: 'component',
                      title: '**Order Service**',
                      subtitle: 'v1.4.2 (Production)',
                      colorGroup: 'purple',
                      entries: [
                        { key: 'Owner', value: 'Trade Team' },
                        { key: 'SLA', value: '99.99%' },
                      ],
                      footer: [Badge({ text: 'Critical', colorGroup: 'red' }), Badge({ text: 'Active', colorGroup: 'green' })],
                      children: [
                        BulletList({
                          items: [
                            'Handles checkout flow',
                            'Integrates with Stripe',
                          ],
                          fontSize: typography.sub.fontSize,
                        }),
                      ],
                    }),
                    DetailCard({
                      id: 'db-detail',
                      icon: 'database',
                      title: '**Main Database**',
                      subtitle: 'AWS RDS (PostgreSQL)',
                      colorGroup: 'blue',
                      entries: [
                        { key: 'Instance', value: 'db.r5.large' },
                        { key: 'Region', value: 'us-east-1' },
                      ],
                      children: [
                        BulletList({
                          items: [
                            'Daily backups enabled',
                            'Multi-AZ deployment',
                          ],
                          fontSize: typography.sub.fontSize,
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
