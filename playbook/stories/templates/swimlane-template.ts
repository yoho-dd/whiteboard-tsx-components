import type { PlaybookStory } from '../../types.js';
import { setTheme, getTheme, spacing, typography } from '../../../src/theme.js';
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
    const theme = getTheme();

    return Whiteboard({
      theme: 'business',
      children: [
        SwimlaneTemplate({
          id: 'swimlane-template-demo',
          title: '跨境退款业务流程 (Cross-Border Refund)',
          lanes: [
            {
              id: 'lane-user',
              title: '用户端 (Customer)',
              colorGroup: 'blue',
              steps: [
                {
                  id: 'user-apply',
                  component: DetailCard({
                    id: 'user-apply-card',
                    icon: 'edit',
                    title: '**发起退款申请**',
                    subtitle: '提交原因与凭证',
                    children: [
                      BulletList({ 
                        items: ['选择原订单', '上传图片证据', '填写退款方式'],
                        fontSize: typography.sub.fontSize,
                      })
                    ],
                  }),
                },
              ],
            },
            {
              id: 'lane-ops',
              title: '运营后台 (Operations)',
              colorGroup: 'yellow',
              steps: [
                {
                  id: 'ops-review',
                  component: DetailCard({
                    id: 'ops-review-card',
                    icon: 'shield',
                    title: '**人工合规审核**',
                    subtitle: '风险等级评估',
                    colorGroup: 'yellow',
                    children: [
                      Callout({ 
                        variant: 'warning', 
                        title: '风控预警', 
                        body: '命中高频退款黑名单时需二级主管复核。',
                        colorGroup: 'yellow'
                      }),
                    ],
                  }),
                },
              ],
            },
            {
              id: 'lane-system',
              title: '核心系统 (Core Systems)',
              colorGroup: 'green',
              steps: [
                {
                  id: 'system-refund',
                  component: DetailCard({
                    id: 'system-refund-card',
                    icon: 'component',
                    title: '**退款流水执行**',
                    subtitle: '自动化资金回退',
                    colorGroup: 'green',
                    children: [
                      FlowchartTemplate({
                        id: 'refund-system-flow',
                        title: '系统内部动作',
                        width: 'fill-container',
                        padding: [spacing.sm, spacing.sm],
                        nodes: [
                          { id: 'lock-order', title: '冻结订单' },
                          { id: 'call-pay', title: '请求网关', shape: 'diamond' },
                          { id: 'write-ledger', title: '入账' },
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
            { id: 'swimlane-conn-2', from: 'ops-review', to: 'system-refund', endArrow: 'arrow', variant: 'main', label: '审核通过' },
          ],
        }),
      ],
    });
  },
};

export default story;
