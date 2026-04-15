import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, HStack, Text } from '../../../src/primitives.js';
import { Card, Divider, LabeledRow, Section } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'layout-labeled-rows',
  category: 'Layout',
  title: '标签行布局',
  description: '展示 LabeledRow、Divider 与 Section 的组合，适合做分层说明、模块分组和对齐检查。',
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
              text: '平台能力分层',
              fontSize: typography.h1.fontSize,
              textColor: '#111827',
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'layout-demo',
              title: '能力分区',
              colorGroup: 'blue',
              children: [
                LabeledRow({
                  id: 'row-access',
                  label: '接入层',
                  labelWidth: 96,
                  colorGroup: 'blue',
                  children: [
                    HStack({
                      gap: spacing.md,
                      children: [
                        Card({ id: 'ingress', title: 'Ingress', subtitle: '域名 / TLS / 灰度' }),
                        Card({ id: 'gateway', title: 'Gateway', subtitle: '鉴权 / 限流 / 路由' }),
                      ],
                    }),
                  ],
                }),
                Divider({ label: 'Core Services', colorGroup: 'blue' }),
                LabeledRow({
                  id: 'row-core',
                  label: '核心层',
                  labelWidth: 96,
                  colorGroup: 'green',
                  children: [
                    HStack({
                      gap: spacing.md,
                      children: [
                        Card({ id: 'trade', title: '交易域', subtitle: '订单 / 支付 / 履约', colorGroup: 'green' }),
                        Card({ id: 'member', title: '会员域', subtitle: '注册 / 成长 / 权益', colorGroup: 'green' }),
                        Card({ id: 'search', title: '搜索域', subtitle: '召回 / 排序 / 推荐', colorGroup: 'green' }),
                      ],
                    }),
                  ],
                }),
                Divider({ label: 'Support Services', colorGroup: 'blue' }),
                LabeledRow({
                  id: 'row-support',
                  label: '支撑层',
                  labelWidth: 96,
                  colorGroup: 'purple',
                  children: [
                    HStack({
                      gap: spacing.md,
                      children: [
                        Card({ id: 'config', title: '配置中心', subtitle: '动态配置', colorGroup: 'purple' }),
                        Card({ id: 'metrics', title: '观测平台', subtitle: '日志 / 指标 / Trace', colorGroup: 'purple' }),
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
