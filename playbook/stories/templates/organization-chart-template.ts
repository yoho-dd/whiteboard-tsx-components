import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, getTheme } from '../../../src/theme.js';
import { Whiteboard } from '../../../src/primitives.js';
import { BulletList, IconCard } from '../../../src/composites.js';
import { OrganizationChartTemplate } from '../../../src/templates.js';

const story: PlaybookStory = {
  id: 'template-organization-chart',
  category: 'Templates',
  title: '模板层：组织架构图',
  description: '演示 OrganizationChartTemplate 的树状布局，展示如何利用 IconCard 增强视觉辨识度。',
  render: () => {
    setTheme('fresh');
    const theme = getTheme();

    return Whiteboard({
      theme: 'fresh',
      children: [
        OrganizationChartTemplate({
          id: 'org-template-demo',
          title: '企业技术部组织架构',
          padding: spacing.xl,
          nodes: [
            {
              id: 'cto',
              title: 'CTO Office',
              component: IconCard({ 
                id: 'cto-card', 
                icon: 'user', 
                title: '**首席技术官**', 
                subtitle: '技术战略 / 委员会 / 架构委员会',
                colorGroup: 'blue' 
              }),
              childrenNodes: [
                {
                  id: 'platform',
                  component: IconCard({
                    id: 'platform-card',
                    icon: 'component',
                    title: '**平台工程部**',
                    subtitle: '基础设施 / 研发效能 / 云原生',
                    colorGroup: 'green',
                    children: [
                      BulletList({ 
                        items: ['IaC & GitOps', 'CI/CD Pipeline', 'K8s 治理'],
                        colorGroup: 'green' 
                      }),
                    ],
                  }),
                  childrenNodes: [
                    {
                      id: 'infra',
                      component: IconCard({ 
                        id: 'infra-card', 
                        icon: 'database', 
                        title: '云架构组', 
                        subtitle: '混合云 / 存储 / 成本优化' 
                      }),
                    },
                    {
                      id: 'qa',
                      component: IconCard({ 
                        id: 'qa-card', 
                        icon: 'shield', 
                        title: '质量工程组', 
                        subtitle: '全链路压测 / 自动化' 
                      }),
                    },
                  ],
                },
                {
                  id: 'business',
                  component: IconCard({ 
                    id: 'business-card', 
                    icon: 'app-outlined', 
                    title: '**业务研发部**', 
                    subtitle: '电商 / 支付 / 营销',
                    colorGroup: 'purple'
                  }),
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
