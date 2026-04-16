import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, getTheme, typography } from '../../../src/theme.js';
import { Whiteboard, Text } from '../../../src/primitives.js';
import { Card, IconCard } from '../../../src/composites.js';
import { ArchitectureTemplate, FlowchartTemplate } from '../../../src/templates.js';

const story: PlaybookStory = {
  id: 'template-architecture',
  category: 'Templates',
  title: '模板层：架构图',
  description: '演示 ArchitectureTemplate 的分层骨架，展示层内节点嵌套子流程图的复杂场景。',
  render: () => {
    setTheme('business');
    const theme = getTheme();

    return Whiteboard({
      theme: 'business',
      children: [
        ArchitectureTemplate({
          id: 'architecture-template-demo',
          title: '电商中台系统架构',
          layers: [
            {
              id: 'access-layer',
              title: '接入与安全层',
              label: 'Gateway',
              colorGroup: 'blue',
              nodes: [
                {
                  id: 'cdn-node',
                  component: IconCard({ id: 'cdn-card', icon: 'cloud', title: '**CDN**', subtitle: '静态加速 / 边缘节点' }),
                },
                {
                  id: 'gateway-node',
                  component: IconCard({
                    id: 'gateway-card',
                    icon: 'shield',
                    title: '**API 网关**',
                    subtitle: 'WAF / 鉴权 / 灰度路由',
                    children: [Card({ id: 'gateway-plugin', title: '观测插件', subtitle: 'Prometheus / Skywalking' })],
                  }),
                },
              ],
            },
            {
              id: 'domain-layer',
              title: '业务领域层',
              label: 'Services',
              colorGroup: 'green',
              nodes: [
                {
                  id: 'trade-node',
                  component: Card({
                    id: 'trade-card',
                    title: '**交易中心**',
                    subtitle: '订单生命周期管理',
                    children: [
                      FlowchartTemplate({
                        id: 'trade-flow',
                        title: '标准下单流程',
                        width: 'fill-container',
                        padding: [spacing.sm, spacing.sm],
                        nodes: [
                          { id: 'trade-req', title: '创建' },
                          { id: 'trade-check', title: '风控', shape: 'diamond' },
                          { id: 'trade-done', title: '完成' },
                        ],
                        edges: [['trade-req', 'trade-check'], ['trade-check', 'trade-done']],
                      }),
                    ]
                  }),
                },
                {
                  id: 'member-node',
                  component: IconCard({ id: 'member-card', icon: 'user', title: '**用户中心**', subtitle: '统一身份与权限' }),
                },
              ],
            },
            {
              id: 'infra-layer',
              title: '基础设施层',
              label: 'Storage',
              colorGroup: 'purple',
              nodes: [
                {
                  id: 'mysql-node',
                  component: IconCard({ id: 'mysql-card', icon: 'database', title: '**MySQL Cluster**', subtitle: '多可用区部署' }),
                },
                {
                  id: 'kafka-node',
                  component: IconCard({ id: 'kafka-card', icon: 'send', title: '**Message Queue**', subtitle: '解耦与削峰填谷' }),
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
