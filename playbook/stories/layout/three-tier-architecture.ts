import type { PlaybookStory } from '../../types.js';
import { setTheme, getTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, HStack, Text, Connector } from '../../../src/primitives.js';
import { Card, Section, IconCard } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'layout-three-tier-architecture',
  category: 'Layout',
  title: '三层系统架构图',
  description: 'Section + Card + Connector 的经典分层布局，适合预览容器嵌套、宽度链和连接线效果。',
  render: () => {
    setTheme('business');
    const theme = getTheme();

    return Whiteboard({
      theme: 'business',
      children: [
        VStack({
          id: 'root',
          width: 1200,
          gap: spacing.xl,
          padding: spacing.xxl,
          fillColor: theme.canvas,
          children: [
            Text({
              id: 'title',
              text: '**三层系统架构图**',
              fontSize: typography.h1.fontSize,
              textColor: theme.text.primary,
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'access-layer',
              title: '用户接入层',
              colorGroup: 'blue',
              children: [
                HStack({
                  gap: spacing.lg,
                  justifyContent: 'center',
                  children: [
                    IconCard({ id: 'cdn', icon: 'cloud', title: '**CDN**', subtitle: '内容分发网络', colorGroup: 'blue' }),
                    IconCard({ id: 'gateway', icon: 'shield', title: '**API 网关**', subtitle: '鉴权 / 限流 / 聚合', colorGroup: 'blue' }),
                  ],
                }),
              ],
            }),
            Section({
              id: 'service-layer',
              title: '业务逻辑层',
              colorGroup: 'green',
              children: [
                HStack({
                  gap: spacing.lg,
                  alignItems: 'stretch',
                  children: [
                    Card({ id: 'order-svc', title: '**订单服务**', subtitle: '下单 / 查询 / 退款' }),
                    Card({ id: 'inventory-svc', title: '**库存服务**', subtitle: '预占 / 扣减 / 盘点' }),
                    Card({ id: 'payment-svc', title: '**支付服务**', subtitle: '收单 / 对账 / 退款' }),
                    Card({ id: 'user-svc', title: '**用户服务**', subtitle: '注册 / 登录 / 权限' }),
                  ],
                }),
              ],
            }),
            Section({
              id: 'data-layer',
              title: '数据持久层',
              colorGroup: 'purple',
              children: [
                HStack({
                  gap: spacing.lg,
                  justifyContent: 'center',
                  children: [
                    IconCard({ id: 'redis', icon: 'zap', title: '**Redis**', subtitle: '缓存 / 锁 / 会话', colorGroup: 'red' }),
                    IconCard({ id: 'mysql', icon: 'database', title: '**MySQL**', subtitle: '主库 / 从库 / 读写分离', colorGroup: 'blue' }),
                    IconCard({ id: 'kafka', icon: 'send', title: '**Kafka**', subtitle: '事件总线', colorGroup: 'yellow' }),
                  ],
                }),
              ],
            }),
          ],
        }),
        Connector({ id: 'c-cdn-gw', from: 'cdn', to: 'gateway', variant: 'main', endArrow: 'arrow', lineShape: 'rightAngle' }),
        Connector({ id: 'c-gw-order', from: 'gateway', to: 'order-svc', variant: 'main', endArrow: 'arrow', lineShape: 'rightAngle' }),
        Connector({ id: 'c-gw-inv', from: 'gateway', to: 'inventory-svc', variant: 'main', endArrow: 'arrow', lineShape: 'rightAngle' }),
        Connector({ id: 'c-gw-pay', from: 'gateway', to: 'payment-svc', variant: 'main', endArrow: 'arrow', lineShape: 'rightAngle' }),
        Connector({ id: 'c-gw-user', from: 'gateway', to: 'user-svc', variant: 'main', endArrow: 'arrow', lineShape: 'rightAngle' }),
        Connector({ id: 'c-order-mysql', from: 'order-svc', to: 'mysql', endArrow: 'arrow', lineShape: 'rightAngle' }),
        Connector({ id: 'c-order-redis', from: 'order-svc', to: 'redis', endArrow: 'arrow', lineShape: 'rightAngle' }),
        Connector({ id: 'c-order-kafka', from: 'order-svc', to: 'kafka', variant: 'async', endArrow: 'arrow', label: '发布事件', lineShape: 'rightAngle' }),
        Connector({ id: 'c-kafka-inv', from: 'kafka', to: 'inventory-svc', variant: 'async', endArrow: 'arrow', label: '消费事件', lineShape: 'rightAngle' }),
      ],
    });
  },
};

export default story;
