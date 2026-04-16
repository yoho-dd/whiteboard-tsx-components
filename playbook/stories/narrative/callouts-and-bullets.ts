import type { PlaybookStory } from '../../types.js';
import { setTheme, spacing, typography } from '../../../src/theme.js';
import { Whiteboard, VStack, HStack, Text } from '../../../src/primitives.js';
import { BulletList, Callout, Divider, Section } from '../../../src/composites.js';

const story: PlaybookStory = {
  id: 'narrative-callouts-and-bullets',
  category: 'Narrative',
  title: '说明框与列表',
  description: '展示 Callout、BulletList、Divider 的组合，适合做规则说明、风险提示和操作步骤。',
  render: () => {
    setTheme('fresh');
    const theme = getTheme();

    return Whiteboard({
      theme: 'fresh',
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
              text: '**Operational Excellence Guidelines**',
              fontSize: typography.h1.fontSize,
              textColor: theme.text.primary,
              width: 'fit-content',
              height: 'fit-content',
            }),
            Section({
              id: 'deployment-guide',
              title: 'Pre-Deployment Checklist',
              colorGroup: 'yellow',
              children: [
                HStack({
                  gap: spacing.lg,
                  alignItems: 'stretch',
                  children: [
                    Callout({
                      id: 'window-info',
                      variant: 'info',
                      title: '**Deployment Window**',
                      body: 'Execution recommended during low-traffic periods. Order: API → Worker → Cron.',
                    }),
                    Callout({
                      id: 'safety-warning',
                      variant: 'warning',
                      title: '**Safety First**',
                      children: [
                        BulletList({
                          items: [
                            'Verify backward compatibility',
                            'Ensure rollback artifacts are ready',
                            'Silence non-critical alerts',
                          ],
                          colorGroup: 'yellow',
                        }),
                      ],
                    }),
                  ],
                }),
                Divider({ label: 'Final Verification', colorGroup: 'yellow' }),
                Callout({
                  id: 'acceptance-success',
                  variant: 'success',
                  title: '**Acceptance Criteria**',
                  children: [
                    BulletList({
                      ordered: true,
                      items: [
                        'Core API smoke tests passed',
                        'Zero new P1/P2 incidents',
                        'SLO returned to baseline',
                      ],
                      colorGroup: 'green',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
};

export default story;
