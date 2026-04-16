import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing } from '../../../src/theme.js';
import { Whiteboard } from '../../../src/primitives.js';
import { DetailCard } from '../../../src/composites.js';
import { FlowchartTemplate } from '../../../src/templates.js';

const story: PlaybookStory = {
  id: 'template-flowchart',
  category: 'Templates',
  title: '模板层：流程图',
  description: '演示 FlowchartTemplate 的 dagre 骨架，以及流程节点内再嵌入架构子图的能力。',
  render: () => {
    setTheme('fresh');

    return Whiteboard({
      theme: 'fresh',
      children: [
        FlowchartTemplate({
          id: 'flowchart-template-demo',
          title: '发布审批流程',
          nodes: [
            {
              id: 'draft-step',
              component: DetailCard({
                id: 'draft-card',
                title: '编写变更',
                subtitle: '需求 / 方案 / 风险',
              }),
            },
            {
              id: 'review-step',
              title: '评审通过？',
              shape: 'diamond',
            },
            {
              id: 'release-step',
              component: DetailCard({
                id: 'release-checklist',
                title: '执行发布',
                subtitle: '检查并放量',
                entries: [
                  { key: '流量', value: '灰度 5%' },
                  { key: '回滚', value: '预案已确认' },
                  { key: '观测', value: 'Dashboard 已准备' },
                ],
              }),
            },
          ],
          edges: [['draft-step', 'review-step'], ['review-step', 'release-step']],
        }),
      ],
    });
  },
};

export default story;
