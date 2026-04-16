import { setTheme, spacing, typography } from './src/theme.js';
import { Whiteboard, VStack, HStack, Text, Rect, Connector } from './src/primitives.js';
import { Section, Legend, Callout, Figure, DetailCard, Table, Badge, BulletList, Divider } from './src/composites.js';

// 使用极简主义主题 (minimalist) - 高对比度，学术感
setTheme('minimalist');

// 数据集：2025年全球电商各区域表现
const regions = [
  { name: 'North America', revenue: 840, growth: 12, topCategory: 'Electronics' },
  { name: 'Europe', revenue: 620, growth: 8, topCategory: 'Fashion' },
  { name: 'Asia Pacific', revenue: 1250, growth: 24, topCategory: 'Home & Living' },
  { name: 'Latin America', revenue: 210, growth: 18, topCategory: 'Beauty' },
];

const maxRevenue = 1500;
const chartHeight = 280;

// 构建柱状图
const bars = regions.map((r, i) => {
  const barHeight = (r.revenue / maxRevenue) * chartHeight;
  const spacer = chartHeight - barHeight;
  
  return VStack({
    id: `bar-v2-${i}`,
    gap: spacing.xs,
    alignItems: 'center',
    children: [
      Text({ id: `val-v2-${i}`, text: `$${r.revenue}B`, fontSize: 11, textColor: '#111827', width: 'fit-content' }),
      Rect({ id: `spacer-v2-${i}`, width: 60, height: spacer, opacity: 0 }),
      Rect({ id: `rect-v2-${i}`, width: 60, height: barHeight, fillColor: '#111827', borderColor: '#000000', borderRadius: 4 }),
      Text({ id: `reg-v2-${i}`, text: r.name, fontSize: 10, textColor: '#6B7280', width: 'fit-content' }),
    ]
  });
});

const doc = Whiteboard({
  theme: 'minimalist',
  children: [
    // 使用 Figure 包装整个图表，提升专业度
    Figure({
      label: 'Analysis 4.2',
      title: '**Global E-commerce Market Performance (FY2025)**',
      caption: 'Source: Market Analysis Group - 2025 Annual Performance Data.',
      width: 1300,
      padding: spacing.xl,
      children: [
        VStack({
          gap: spacing.lg,
          children: [
            // 第一排：核心指标摘要 (使用高密度 DetailCard)
            HStack({
              gap: spacing.lg,
              alignItems: 'stretch',
              children: [
                DetailCard({
                  id: 'total-metrics',
                  icon: 'activity',
                  title: '**Key Performance Indicators**',
                  subtitle: 'Aggregate global metrics',
                  entries: [
                    { key: 'Total GMV', value: '$2.92 Trillion' },
                    { key: 'YoY Growth', value: '+16.4%' },
                    { key: 'Retention', value: '72%' },
                  ],
                  footer: [
                    Badge({ text: 'On Track', colorGroup: 'green' }),
                    Badge({ text: 'High Priority', colorGroup: 'blue' }),
                  ],
                  colorGroup: 'blue',
                  flex: 1,
                }),
                DetailCard({
                  id: 'growth-insight',
                  icon: 'zap',
                  title: '**Market Penetration**',
                  subtitle: 'Regional share analysis',
                  entries: [
                    { key: 'APAC Leader', value: '42.8% Share' },
                    { key: 'LATAM Speed', value: '18.2% Growth' },
                  ],
                  children: [
                    BulletList({
                      items: [
                        'Mobile commerce up by **28%**',
                        'Social shopping integration completed'
                      ]
                    })
                  ],
                  colorGroup: 'purple',
                  flex: 1,
                }),
              ]
            }),

            // 第二排：可视化图表与详细列表
            HStack({
              gap: spacing.lg,
              alignItems: 'stretch',
              children: [
                // 左侧：柱状图区
                Section({
                  id: 'viz-section',
                  title: 'Revenue by Region (Billions USD)',
                  colorGroup: 'blue',
                  flex: 2,
                  children: [
                    VStack({
                      gap: spacing.md,
                      children: [
                        Legend({
                          items: [
                            { color: '#111827', label: 'FY2025 Revenue' },
                            { color: '#E5E7EB', label: 'Projected 2026' }
                          ]
                        }),
                        HStack({
                          id: 'main-bars',
                          gap: 40,
                          alignItems: 'end',
                          justifyContent: 'center',
                          children: bars
                        })
                      ]
                    })
                  ]
                }),

                // 右侧：数据表格 (Table)
                Section({
                  id: 'table-section',
                  title: 'Top Categories Data',
                  colorGroup: 'green',
                  flex: 1.5,
                  children: [
                    Table({
                      headers: ['Category', 'Volume', 'Status'],
                      rows: [
                        ['Electronics', '$420B', Badge({ text: 'Peak', colorGroup: 'red' })],
                        ['Home & Living', '$310B', Badge({ text: 'Rising', colorGroup: 'green' })],
                        ['Fashion', '$280B', Badge({ text: 'Stable', colorGroup: 'blue' })],
                        ['Beauty', '$150B', Badge({ text: 'Rising', colorGroup: 'green' })],
                      ],
                      striped: true
                    })
                  ]
                })
              ]
            }),

            // 第三排：重要标注与总结 (Callout)
            Callout({
              id: 'final-insight',
              variant: 'info',
              title: '**Regional Analysis Conclusion**',
              body: 'Asia Pacific continues to drive the majority of global growth, with **Latin America** emerging as the fastest-growing secondary market. Strategy shift towards mobile-first in APAC is highly recommended.',
            }),
          ]
        })
      ]
    }),
    
    // 跨层级连线：建立指标与洞察的联系 (规范化的折线连接)
    Connector({
      id: 'conn-insight',
      from: 'total-metrics',
      to: 'final-insight',
      variant: 'async',
      label: 'Derived Strategy',
      lineShape: 'curve',
      fromAnchor: 'bottom',
      toAnchor: 'top'
    })
  ]
});

console.log(JSON.stringify(doc, null, 2));