import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing } from '../../../src/theme.js';
import { Whiteboard } from '../../../src/primitives.js';
import { Card, IconCard } from '../../../src/composites.js';
import { ArchitectureTemplate, FlowchartTemplate } from '../../../src/templates.js';

const story: PlaybookStory = {
  id: 'template-architecture',
  category: 'Templates',
  title: '模板层：架构图',
  description: '演示 ArchitectureTemplate 的分层骨架，以及层内节点嵌套子流程图的能力。',
  render: () => {
    setTheme('classic');

    return Whiteboard({
      theme: 'classic',
      children: [
        ArchitectureTemplate({
          id: 'architecture-template-demo',
          title: '电商平台架构模板',
          layers: [
            {
              id: 'access-layer',
              title: '接入层',
              label: '入口',
              colorGroup: 'blue',
              nodes: [
                {
                  id: 'cdn-node',
                  component: Card({ id: 'cdn-card', title: 'CDN', subtitle: '静态加速 / 边缘缓存' }),
                },
                {
                  id: 'gateway-node',
                  component: IconCard({
                    id: 'gateway-card',
                    icon: 'shield',
                    title: '网关',
                    subtitle: '鉴权 / 限流 / 路由',
                    children: [Card({ id: 'gateway-plugin', title: '插件层', subtitle: '灰度 / 观测 / 熔断' })],
                  }),
                },
              ],
            },
            {
              id: 'domain-layer',
              title: '领域层',
              label: '核心',
              colorGroup: 'green',
              nodes: [
                {
                  id: 'trade-node',
                  component: Card({
                    id: 'trade-card',
                    title: '交易域',
                    subtitle: '订单 / 履约 / 结算',
                    children: [
                      FlowchartTemplate({
                        id: 'trade-flow',
                        title: '交易主链路',
                        width: 'fill-container',
                        padding: [spacing.sm, spacing.sm],
                        nodes: [
                          { id: 'trade-req', title: '请求' },
                          { id: 'trade-check', title: '校验', shape: 'diamond' },
                          { id: 'trade-done', title: '下单成功' },
                        ],
                        edges: [['trade-req', 'trade-check'], ['trade-check', 'trade-done']],
                      }),
                    ]
                  }),
                },
                {
                  id: 'member-node',
                  component: Card({ id: 'member-card', title: '会员域', subtitle: '画像 / 等级 / 权益' }),
                },
              ],
            },
            {
              id: 'infra-layer',
              title: '基础设施层',
              label: '底座',
              colorGroup: 'purple',
              nodes: [
                {
                  id: 'mysql-node',
                  component: Card({ id: 'mysql-card', title: 'MySQL', subtitle: '交易主库 / 读写分离' }),
                },
                {
                  id: 'kafka-node',
                  component: Card({ id: 'kafka-card', title: 'Kafka', subtitle: '事件总线 / 异步解耦' }),
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
