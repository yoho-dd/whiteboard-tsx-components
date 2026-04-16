import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, typography, getTheme } from '../../../src/theme.js';
import { Whiteboard, VStack, Text } from '../../../src/primitives.js';
import { Badge, BulletList, Pipeline, Section } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'flow-pipeline-lifecycle',
  category: 'Flow',
  title: 'Pipeline 生命周期',
  description: '展示 Pipeline 的自动连线和步骤内容扩展，适合审批流、任务流和数据处理链路。',
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
              text: '**Order Processing Pipeline**',
              fontSize: typography.h1.fontSize,
              textColor: theme.text.primary,
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'pipeline-section',
              title: 'End-to-End Lifecycle',
              colorGroup: 'green',
              children: [
                Pipeline({
                  id: 'order-pipeline',
                  colorGroup: 'green',
                  connectorVariant: 'main',
                  steps: [
                    {
                      id: 'validate',
                      icon: 'check-circle',
                      title: 'Validate',
                      subtitle: 'Schema & Inventory Pre-check',
                      children: [Badge({ text: 'Synchronous', colorGroup: 'blue' })],
                    },
                    {
                      id: 'reserve',
                      icon: 'database',
                      title: 'Reserve',
                      subtitle: 'Lock Inventory & Persist',
                      children: [
                        BulletList({ 
                          items: [
                            'Optimistic Locking',
                            'Idempotency Key',
                          ], 
                          fontSize: typography.sub.fontSize,
                          colorGroup: 'green' 
                        })
                      ],
                    },
                    {
                      id: 'pay',
                      icon: 'credit-card',
                      title: 'Payment',
                      subtitle: 'External Gateway Integration',
                      children: [Badge({ text: 'External', colorGroup: 'yellow' })],
                    },
                    {
                      id: 'notify',
                      icon: 'send',
                      title: 'Notification',
                      subtitle: 'Webhook & Event Bus',
                      children: [Badge({ text: 'Asynchronous', colorGroup: 'purple' })],
                    },
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
