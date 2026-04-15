import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, HStack, Text } from '../../../src/primitives.js';
import { Badge, BulletList, DetailCard, Section } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'cards-detail-cards',
  category: 'Cards',
  title: '详情卡片',
  description: '展示 DetailCard 的头部、条目区、正文区和 footer，适合接口说明、资源概览和配置详情。',
  render: () => {
    setTheme('tech');

    return Whiteboard({
      theme: 'tech',
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
              text: 'Detail Cards',
              fontSize: typography.h1.fontSize,
              textColor: '#1F2329',
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'detail-cards',
              title: 'Resource Detail',
              colorGroup: 'green',
              children: [
                HStack({
                  gap: spacing.md,
                  alignItems: 'stretch',
                  children: [
                    DetailCard({
                      id: 'api-spec',
                      icon: 'api',
                      title: '**GET /orders**',
                      subtitle: '订单列表查询接口',
                      colorGroup: 'blue',
                      entries: [
                        { key: 'Auth', value: 'Bearer Token' },
                        { key: 'Rate', value: '60 req/min' },
                        { key: 'Owner', value: 'trade-api' },
                      ],
                      children: [
                        BulletList({
                          items: ['支持分页与筛选', '默认按创建时间倒序', '返回聚合金额字段'],
                          colorGroup: 'blue',
                        }),
                      ],
                      footer: [
                        Badge({ text: 'public', colorGroup: 'green' }),
                        Badge({ text: 'v2', colorGroup: 'purple' }),
                      ],
                    }),
                    DetailCard({
                      id: 'job-detail',
                      icon: 'clock',
                      title: '**Nightly ETL**',
                      subtitle: '离线同步任务',
                      colorGroup: 'purple',
                      entries: [
                        { key: 'Schedule', value: '02:30 every day' },
                        { key: 'Input', value: 'ODS + CDC' },
                        { key: 'Output', value: 'DWS.order_summary' },
                      ],
                      children: [
                        BulletList({
                          items: ['失败自动重试 2 次', '成功后触发报表刷新'],
                          colorGroup: 'purple',
                        }),
                      ],
                      footer: [Badge({ text: 'internal', colorGroup: 'yellow' })],
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
