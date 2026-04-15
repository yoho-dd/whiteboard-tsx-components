import { setTheme } from '../src/theme.js';
import {
  Whiteboard, VStack, HStack, Text, Connector,
} from '../src/primitives.js';
import { Card, Section } from '../src/composites.js';
import { spacing, typography } from '../src/theme.js';

// ❶ 先设主题
setTheme('classic');

const doc = Whiteboard({
  theme: 'classic',
  children: [
    VStack({
      id: 'root',
      width: 1200,
      gap: spacing.lg,
      padding: spacing.xl,
      fillColor: '#F8FAFC',
      children: [
        // ── 标题 ──
        Text({
          id: 'title',
          text: '三层系统架构图',
          fontSize: typography.h1.fontSize,
          textColor: '#1F2329',
          width: 'fit-content',
          height: 'fit-content',
        }),

        // ── 用户接入层（蓝色 · 虚线框）──
        Section({
          id: 'access-layer',
          title: '用户接入层',
          colorGroup: 'blue',
          borderDash: 'dashed',
          children: [
            HStack({
              gap: spacing.lg,
              justifyContent: 'center',
              children: [
                Card({ id: 'cdn', title: '**CDN**', subtitle: '内容分发网络', colorGroup: 'blue' }),
                Card({ id: 'gateway', title: '**API 网关**', subtitle: '流量入口 / 鉴权 / 限流', colorGroup: 'blue' }),
              ],
            }),
          ],
        }),

        // ── 业务逻辑层（绿色 · 虚线框）──
        Section({
          id: 'biz-layer',
          title: '业务逻辑层',
          colorGroup: 'green',
          borderDash: 'dashed',
          children: [
            HStack({
              gap: spacing.md,
              alignItems: 'stretch',
              children: [
                Card({ id: 'order-svc', title: '**订单服务**', subtitle: '下单 / 退款 / 查询', colorGroup: 'green' }),
                Card({ id: 'inventory-svc', title: '**库存服务**', subtitle: '扣减 / 预占 / 盘点', colorGroup: 'green' }),
                Card({ id: 'payment-svc', title: '**支付服务**', subtitle: '收银 / 对账 / 退款', colorGroup: 'green' }),
                Card({ id: 'user-svc', title: '**用户服务**', subtitle: '注册 / 登录 / 权限', colorGroup: 'green' }),
              ],
            }),
          ],
        }),

        // ── 数据持久层（紫色 · 虚线框）──
        Section({
          id: 'data-layer',
          title: '数据持久层',
          colorGroup: 'purple',
          borderDash: 'dashed',
          children: [
            HStack({
              gap: spacing.lg,
              justifyContent: 'center',
              children: [
                Card({ id: 'redis', title: '**Redis 集群**', subtitle: '缓存 / 会话 / 分布式锁', colorGroup: 'red' }),
                Card({ id: 'mysql', title: '**MySQL 主从**', subtitle: '业务主库 / 读写分离', colorGroup: 'purple' }),
                Card({ id: 'kafka', title: '**Kafka**', subtitle: '异步消息 / 事件流', colorGroup: 'yellow' }),
              ],
            }),
          ],
        }),
      ],
    }),

    // ── 主链路：CDN → 网关 ──
    Connector({ id: 'c-cdn-gw', from: 'cdn', to: 'gateway', variant: 'main', endArrow: 'arrow' }),

    // ── 网关 → 业务服务（主链路）──
    Connector({ id: 'c-gw-order', from: 'gateway', to: 'order-svc', variant: 'main', endArrow: 'arrow' }),
    Connector({ id: 'c-gw-inv', from: 'gateway', to: 'inventory-svc', variant: 'main', endArrow: 'arrow' }),
    Connector({ id: 'c-gw-pay', from: 'gateway', to: 'payment-svc', variant: 'main', endArrow: 'arrow' }),
    Connector({ id: 'c-gw-user', from: 'gateway', to: 'user-svc', variant: 'main', endArrow: 'arrow' }),

    // ── 业务服务 → 数据层 ──
    // 订单服务
    Connector({ id: 'c-order-mysql', from: 'order-svc', to: 'mysql', endArrow: 'arrow' }),
    Connector({ id: 'c-order-redis', from: 'order-svc', to: 'redis', endArrow: 'arrow' }),
    Connector({ id: 'c-order-kafka', from: 'order-svc', to: 'kafka', variant: 'async', endArrow: 'arrow', label: '发布事件' }),

    // 库存服务
    Connector({ id: 'c-inv-mysql', from: 'inventory-svc', to: 'mysql', endArrow: 'arrow' }),
    Connector({ id: 'c-inv-redis', from: 'inventory-svc', to: 'redis', endArrow: 'arrow' }),

    // 支付服务
    Connector({ id: 'c-pay-mysql', from: 'payment-svc', to: 'mysql', endArrow: 'arrow' }),

    // 用户服务
    Connector({ id: 'c-user-mysql', from: 'user-svc', to: 'mysql', endArrow: 'arrow' }),
    Connector({ id: 'c-user-redis', from: 'user-svc', to: 'redis', endArrow: 'arrow' }),

    // Kafka → 库存服务（消费消息，双向场景）
    Connector({ id: 'c-kafka-inv', from: 'kafka', to: 'inventory-svc', variant: 'async', endArrow: 'arrow', label: '消费事件' }),
  ],
});

console.log(JSON.stringify(doc, null, 2));
