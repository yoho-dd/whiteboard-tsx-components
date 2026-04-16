import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing } from '../../../src/theme.js';
import { Whiteboard } from '../../../src/primitives.js';
import { BulletList, Callout } from '../../../src/composites.js';
import { ComparisonTemplate, FlowchartTemplate } from '../../../src/templates.js';

const story: PlaybookStory = {
  id: 'template-comparison',
  category: 'Templates',
  title: '模板层：对比图',
  description: '演示 ComparisonTemplate 的多列对比骨架，以及列内嵌入 shape、组件和子流程的能力。',
  render: () => {
    setTheme('tech');

    return Whiteboard({
      theme: 'tech',
      children: [
        ComparisonTemplate({
          id: 'comparison-template-demo',
          title: '方案对比',
          columns: [
            {
              id: 'column-self-build',
              title: '自研方案',
              colorGroup: 'blue',
              items: [
                BulletList({ items: ['可控性高', '需要长期投入', '团队能力要求高'] }),
                Callout({ variant: 'info', title: '适用', body: '核心链路、平台能力、长期演进需求强。' }),
              ],
            },
            {
              id: 'column-saas',
              title: 'SaaS 方案',
              colorGroup: 'green',
              shape: {
                type: 'rect',
                borderRadius: 12,
                fillColor: '#FFFFFF',
                borderColor: '#B8E0C2',
                borderWidth: 1,
                contentPadding: [spacing.sm, spacing.sm],
              },
              children: [
                BulletList({ items: ['交付快', '前期成本低', '扩展能力受限'] }),
                FlowchartTemplate({
                  id: 'saas-rollout',
                  title: '上线路径',
                  width: 'fill-container',
                  padding: [spacing.sm, spacing.sm],
                  nodes: [
                    { id: 'saas-poc', title: 'POC' },
                    { id: 'saas-buy', title: '采购' },
                    { id: 'saas-launch', title: '接入上线' },
                  ],
                  edges: [['saas-poc', 'saas-buy'], ['saas-buy', 'saas-launch']],
                }),
              ],
            },
          ],
        }),
      ],
    });
  },
};

export default story;
