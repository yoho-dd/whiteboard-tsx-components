/**
 * Quick test script — run with: npx tsx src/components/try-components.ts
 *
 * Outputs the JSON DSL that the component library generates.
 * You can pipe this JSON into the existing CLI: npx tsx src/components/try-components.ts | whiteboard-cli -o output.png
 */

import { setTheme } from '../src/theme.js';
import {
  Whiteboard,
  VStack,
  HStack,
  Text,
  Connector,
  Rect,
  Diamond,
} from '../src/primitives.js';
import { Card, IconCard, Badge, Section, LabeledRow } from '../src/composites.js';
import { spacing, typography } from '../src/theme.js';

// ── Set theme before building the tree (JSX children evaluate eagerly) ──
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
      height: 'fit-content',
      children: [
        // Title
        Text({
          id: 'title',
          text: 'System Architecture',
          fontSize: typography.h1.fontSize,
          textColor: '#1F2329',
          width: 'fit-content',
          height: 'fit-content',
        }),

        // Access Layer (blue)
        Section({
          id: 'access-section',
          title: 'Access Layer',
          colorGroup: 'blue',
          gap: spacing.md,
          children: [
            HStack({
              gap: spacing.md,
              alignItems: 'stretch',
              children: [
                IconCard({
                  id: 'nginx',
                  icon: 'cloud-server',
                  title: '**Nginx**',
                  subtitle: 'Load Balancer',
                  colorGroup: 'blue',
                }),
                IconCard({
                  id: 'api',
                  icon: 'api',
                  title: '**API Gateway**',
                  subtitle: 'REST + GraphQL',
                  colorGroup: 'blue',
                }),
              ],
            }),
          ],
        }),

        // Service Layer (green)
        Section({
          id: 'service-section',
          title: 'Service Layer',
          colorGroup: 'green',
          gap: spacing.md,
          children: [
            HStack({
              gap: spacing.md,
              alignItems: 'stretch',
              children: [
                Card({
                  id: 'user-svc',
                  title: 'User Service',
                  subtitle: 'Authentication',
                  colorGroup: 'green',
                }),
                Card({
                  id: 'order-svc',
                  title: 'Order Service',
                  subtitle: 'CQRS Pattern',
                  colorGroup: 'green',
                }),
                Card({
                  id: 'pay-svc',
                  title: 'Payment',
                  subtitle: 'Stripe Integration',
                  colorGroup: 'green',
                }),
              ],
            }),
          ],
        }),

        // Data Layer (purple)
        Section({
          id: 'data-section',
          title: 'Data Layer',
          colorGroup: 'purple',
          gap: spacing.md,
          children: [
            HStack({
              gap: spacing.md,
              children: [
                Card({
                  id: 'pg',
                  title: 'PostgreSQL',
                  subtitle: 'Primary DB',
                  colorGroup: 'purple',
                }),
                Card({
                  id: 'redis',
                  title: 'Redis',
                  subtitle: 'Cache Layer',
                  colorGroup: 'purple',
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    // Connectors
    Connector({ id: 'c1', from: 'nginx', to: 'api', variant: 'main' }),
    Connector({ id: 'c2', from: 'api', to: 'user-svc' }),
    Connector({ id: 'c3', from: 'api', to: 'order-svc' }),
    Connector({ id: 'c4', from: 'api', to: 'pay-svc' }),
    Connector({ id: 'c5', from: 'user-svc', to: 'pg', variant: 'main' }),
    Connector({ id: 'c6', from: 'order-svc', to: 'redis', variant: 'async', label: 'cache' }),
  ],
});

console.log(JSON.stringify(doc, null, 2));
