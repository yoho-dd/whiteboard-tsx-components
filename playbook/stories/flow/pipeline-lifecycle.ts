import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, Text } from '../../../src/primitives.js';
import { Badge, BulletList, Pipeline, Section } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'flow-pipeline-lifecycle',
  category: 'Flow',
  title: 'Pipeline 生命周期',
  description: '展示 Pipeline 的自动连线和步骤内容扩展，适合审批流、任务流和数据处理链路。',
  render: () => {
    setTheme('classic');

    return Whiteboard({
      theme: 'classic',
      children: [
        VStack({
          id: 'root',
          width: 1180,
          gap: spacing.lg,
          padding: spacing.xl,
          fillColor: '#F8FAFC',
          children: [
            Text({
              id: 'title',
              text: 'Order Lifecycle Pipeline',
              fontSize: typography.h1.fontSize,
              textColor: '#1F2329',
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'pipeline-section',
              title: '端到端链路',
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
                      title: '校验',
                      subtitle: '参数与库存预检',
                      children: [Badge({ text: 'sync', colorGroup: 'blue' })],
                    },
                    {
                      id: 'reserve',
                      icon: 'database',
                      title: '预占',
                      subtitle: '锁库存 + 落库',
                      children: [BulletList({ items: ['行锁', '幂等键'], colorGroup: 'green' })],
                    },
                    {
                      id: 'pay',
                      icon: 'credit-card',
                      title: '支付',
                      subtitle: '调用收单渠道',
                      children: [Badge({ text: 'external', colorGroup: 'yellow' })],
                    },
                    {
                      id: 'notify',
                      icon: 'send',
                      title: '通知',
                      subtitle: '回调业务系统',
                      children: [Badge({ text: 'async', colorGroup: 'purple' })],
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
