import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, getTheme } from '../../../src/theme.js';
import { Whiteboard } from '../../../src/primitives.js';
import { DetailCard, IconCard } from '../../../src/composites.js';
import { FlowchartTemplate } from '../../../src/templates.js';

const story: PlaybookStory = {
  id: 'template-flowchart',
  category: 'Templates',
  title: '模板层：流程图',
  description: '演示 FlowchartTemplate 的 dagre 骨架，展示如何在流程节点内嵌套复杂复合组件。',
  render: () => {
    setTheme('business');
    const theme = getTheme();

    return Whiteboard({
      theme: 'business',
      children: [
        FlowchartTemplate({
          id: 'flowchart-template-demo',
          title: '变更发布审批流程',
          nodes: [
            {
              id: 'draft-step',
              component: DetailCard({
                id: 'draft-card',
                icon: 'edit',
                title: '**编写变更方案**',
                subtitle: '需求分析 / 影响范围 / 风险预案',
                colorGroup: 'blue',
              }),
            },
            {
              id: 'review-step',
              title: '**技术评审通过？**',
              shape: 'diamond',
              colorGroup: 'yellow',
            },
            {
              id: 'release-step',
              component: DetailCard({
                id: 'release-checklist',
                icon: 'rocket',
                title: '**生产环境发布**',
                subtitle: '灰度放量与观测验收',
                colorGroup: 'green',
                entries: [
                  { key: '策略', value: '金丝雀发布 (5% -> 20% -> 100%)' },
                  { key: '观测', value: 'Grafana Dashboard / Sentry' },
                ],
              }),
            },
          ],
          edges: [
            ['draft-step', 'review-step', '提交'], 
            ['review-step', 'release-step', '通过']
          ],
        }),
      ],
    });
  },
};

export default story;
