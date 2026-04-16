import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing } from '../../../src/theme.js';
import { Whiteboard } from '../../../src/primitives.js';
import { BulletList, Callout, DetailCard } from '../../../src/composites.js';
import { SwimlaneTemplate, FlowchartTemplate } from '../../../src/templates.js';

const story: PlaybookStory = {
  id: 'template-swimlane',
  category: 'Templates',
  title: '模板层：泳道图',
  description: '演示 SwimlaneTemplate 的泳道布局、跨泳道连接，以及步骤节点嵌套子流程的能力。',
  render: () => {
    setTheme('business');

    return Whiteboard({
      theme: 'business',
      children: [
        SwimlaneTemplate({
          id: 'swimlane-template-demo',
          title: '退款协同泳道',
          lanes: [
            {
              id: 'lane-user',
              title: '用户',
              colorGroup: 'blue',
              steps: [
                {
                  id: 'user-apply',
                  component: DetailCard({
                    id: 'user-apply-card',
                    title: '提交退款',
                    subtitle: '上传凭证',
                    children: [BulletList({ items: ['选择订单', '说明原因'] })],
                  }),
                },
              ],
            },
            {
              id: 'lane-ops',
              title: '运营',
              colorGroup: 'yellow',
              steps: [
                {
                  id: 'ops-review',
                  component: DetailCard({
                    id: 'ops-review-card',
                    title: '人工审核',
                    colorGroup: 'yellow',
                    children: [
                      Callout({ variant: 'warning', title: '异常订单', body: '命中高风险规则时升级复核。' }),
                    ],
                  }),
                },
              ],
            },
            {
              id: 'lane-system',
              title: '系统',
              colorGroup: 'green',
              steps: [
                {
                  id: 'system-refund',
                  component: DetailCard({
                    id: 'system-refund-card',
                    title: '退款执行',
                    colorGroup: 'green',
                    children: [
                      FlowchartTemplate({
                        id: 'refund-system-flow',
                        title: '系统动作',
                        width: 'fill-container',
                        padding: [spacing.sm, spacing.sm],
                        nodes: [
                          { id: 'lock-order', title: '锁单' },
                          { id: 'call-pay', title: '调用支付', shape: 'diamond' },
                          { id: 'write-ledger', title: '记账' },
                        ],
                        edges: [['lock-order', 'call-pay'], ['call-pay', 'write-ledger']],
                      }),
                    ],
                  }),
                },
              ],
            },
          ],
          connectors: [
            { id: 'swimlane-conn-1', from: 'user-apply', to: 'ops-review', endArrow: 'arrow', variant: 'main' },
            { id: 'swimlane-conn-2', from: 'ops-review', to: 'system-refund', endArrow: 'arrow', variant: 'secondary' },
          ],
        }),
      ],
    });
  },
};

export default story;
