import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, HStack, Text } from '../../../src/primitives.js';
import { BulletList, Callout, Divider, Section } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'narrative-callouts-and-bullets',
  category: 'Narrative',
  title: '说明框与列表',
  description: '展示 Callout、BulletList、Divider 的组合，适合做规则说明、风险提示和操作步骤。',
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
              text: 'Operational Notes',
              fontSize: typography.h1.fontSize,
              textColor: '#1F2329',
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'notes',
              title: '发布前检查',
              colorGroup: 'yellow',
              children: [
                HStack({
                  gap: spacing.md,
                  alignItems: 'stretch',
                  children: [
                    Callout({
                      id: 'info',
                      variant: 'info',
                      title: '**发布窗口**',
                      body: '建议在流量低峰期执行，灰度顺序遵循 API -> Worker -> Cron。',
                    }),
                    Callout({
                      id: 'warning',
                      variant: 'warning',
                      title: '**注意事项**',
                      children: [
                        BulletList({
                          items: ['确认数据库 schema 已兼容', '确保回滚包已上传到制品库', '检查告警静默是否已设置'],
                          colorGroup: 'yellow',
                        }),
                      ],
                    }),
                  ],
                }),
                Divider({ label: 'Checklist', colorGroup: 'yellow' }),
                Callout({
                  id: 'success',
                  variant: 'success',
                  title: '**验收标准**',
                  children: [
                    BulletList({
                      ordered: true,
                      items: ['核心 API 冒烟通过', '无新增 P1 / P2 告警', 'SLO 恢复到基线区间'],
                      colorGroup: 'green',
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
