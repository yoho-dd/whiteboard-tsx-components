import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, getTheme } from '../../../src/theme.js';
import { Whiteboard } from '../../../src/primitives.js';
import { BulletList, Callout, IconCard } from '../../../src/composites.js';
import { ComparisonTemplate, FlowchartTemplate } from '../../../src/templates.js';

const story: PlaybookStory = {
  id: 'template-comparison',
  category: 'Templates',
  title: '模板层：对比图',
  description: '演示 ComparisonTemplate 的多列对比骨架，展示如何在列内嵌入混合组件和流程图。',
  render: () => {
    setTheme('fresh');
    const theme = getTheme();

    return Whiteboard({
      theme: 'fresh',
      children: [
        ComparisonTemplate({
          id: 'comparison-template-demo',
          title: '系统架构演进方案对比',
          columns: [
            {
              id: 'column-monolith',
              title: '单体架构 (Monolith)',
              colorGroup: 'blue',
              items: [
                BulletList({ 
                  items: [
                    '开发与部署简单',
                    '代码库庞大，编译慢',
                    '单点故障风险高',
                  ],
                  colorGroup: 'blue' 
                }),
                Callout({ 
                  variant: 'info', 
                  title: '推荐场景', 
                  body: '初创项目、内部工具、低复杂度业务。',
                  colorGroup: 'blue'
                }),
              ],
            },
            {
              id: 'column-microservices',
              title: '微服务架构 (Microservices)',
              colorGroup: 'green',
              children: [
                BulletList({ 
                  items: [
                    '独立扩展与部署',
                    '技术栈灵活可选',
                    '运维复杂度极高',
                  ],
                  colorGroup: 'green'
                }),
                FlowchartTemplate({
                  id: 'microservices-rollout',
                  title: '平滑迁移路径',
                  width: 'fill-container',
                  padding: [spacing.sm, spacing.sm],
                  nodes: [
                    { id: 'ms-poc', title: '服务拆分 POC' },
                    { id: 'ms-infra', title: '治理底座建设' },
                    { id: 'ms-launch', title: '分批迁移上线' },
                  ],
                  edges: [['ms-poc', 'ms-infra'], ['ms-infra', 'ms-launch']],
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
