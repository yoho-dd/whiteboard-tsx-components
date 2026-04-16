import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing } from '../../../src/theme.js';
import { Whiteboard } from '../../../src/primitives.js';
import { BulletList, Card } from '../../../src/composites.js';
import { OrganizationChartTemplate } from '../../../src/templates.js';

const story: PlaybookStory = {
  id: 'template-organization-chart',
  category: 'Templates',
  title: '模板层：组织架构图',
  description: '演示 OrganizationChartTemplate 的树状骨架，以及部门节点内嵌对比内容的能力。',
  render: () => {
    setTheme('minimalist');

    return Whiteboard({
      theme: 'minimalist',
      children: [
        OrganizationChartTemplate({
          id: 'org-template-demo',
          title: '平台研发组织',
          padding: spacing.xl,
          nodes: [
            {
              id: 'cto',
              title: 'CTO',
              component: Card({ id: 'cto-card', title: 'CTO', subtitle: '技术战略 / 架构治理' }),
              childrenNodes: [
                {
                  id: 'platform',
                  component: Card({
                    id: 'platform-card',
                    title: '平台工程部',
                    subtitle: '基础设施 / 效能 / 质量',
                    children: [
                      BulletList({ items: ['研发效能', '基础设施', '质量平台'] }),
                    ],
                  }),
                  childrenNodes: [
                    {
                      id: 'infra',
                      component: Card({ id: 'infra-card', title: '基础设施组', subtitle: '网络 / 资源 / 成本' }),
                    },
                    {
                      id: 'qa',
                      component: Card({ id: 'qa-card', title: '质量工程组', subtitle: '自动化 / 发布门禁' }),
                    },
                  ],
                },
                {
                  id: 'business',
                  component: Card({ id: 'business-card', title: '业务研发部', subtitle: '交易 / 会员 / 搜索' }),
                },
              ],
            },
          ],
        }),
      ],
    });
  },
};

export default story;
