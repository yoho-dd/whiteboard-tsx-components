import { setTheme, spacing, typography } from '../src/theme.js';
import { Whiteboard, VStack, HStack, Text, Rect } from '../src/primitives.js';
import { Section, Legend, Callout } from '../src/composites.js';

setTheme('business');

// 季度营收数据（单位：百万）
const revenueData = [
  { quarter: 'Q1 2025', revenue: 420, users: 1.2 },
  { quarter: 'Q2 2025', revenue: 480, users: 1.5 },
  { quarter: 'Q3 2025', revenue: 510, users: 1.8 },
  { quarter: 'Q4 2025', revenue: 620, users: 2.1 },
];

const maxRevenue = 700;
const maxUsers = 2.5;
const chartHeight = 300;
const barWidth = 80;

// 创建收入柱状图组件
const bars = revenueData.map((d, i) => {
  const height = (d.revenue / maxRevenue) * chartHeight;
  const spacer = chartHeight - height;
  
  return VStack({
    id: `bar-${i}`,
    gap: 8,
    alignItems: 'center',
    children: [
      // 数值标签
      Text({ id: `label-${i}`, text: `$${d.revenue}M`, fontSize: typography.body.fontSize, textColor: '#2D3748', width: 'fit-content' }),
      // 底部占位推高柱子
      Rect({ id: `spacer-${i}`, width: barWidth, height: spacer, opacity: 0 }),
      // 柱子
      Rect({ id: `rect-${i}`, width: barWidth, height: height, fillColor: '#5A67D8', borderColor: '#4C51BF', borderRadius: 6 }),
      // 季度标签
      Text({ id: `quarter-${i}`, text: d.quarter, fontSize: typography.sub.fontSize, textColor: '#4A5568', width: 'fit-content' }),
    ]
  });
});

// 创建用户增长趋势（简单版，使用折线示意图）
const trendLine = VStack({
  id: 'trend-container',
  gap: 0,
  children: [
    Rect({ id: 'trend-spacer', width: 1, height: chartHeight, opacity: 0 }),
    Text({ id: 'trend-label', text: 'User Growth', fontSize: typography.sub.fontSize, textColor: '#4A5568', width: 'fit-content' })
  ]
});

const doc = Whiteboard({
  theme: 'business',
  children: [
    VStack({
      id: 'root',
      width: 1200,
      gap: spacing.lg,
      padding: spacing.xxl,
      fillColor: '#F7FAFC',
      children: [
        Text({
          id: 'title',
          text: '**2025 Financial Performance & User Growth**',
          fontSize: typography.h1.fontSize,
          textColor: '#1A202C',
          width: 'fit-content',
        }),
        
        Section({
          id: 'chart-section',
          title: 'Quarterly Revenue (Million USD)',
          colorGroup: 'blue',
          children: [
            Legend({
              items: [
                { color: '#5A67D8', label: 'Quarterly Revenue' },
                { color: '#48BB78', label: 'YoY Growth Target' },
              ]
            }),
            
            Callout({
              variant: 'success',
              title: 'Milestone Achieved!',
              body: 'Q4 2025 revenue exceeded $600M, up 47.6% YoY.',
            }),
            
            HStack({
              id: 'chart-area',
              gap: 60,
              alignItems: 'end',
              justifyContent: 'center',
              children: bars,
            }),
          ]
        }),
        
        Section({
          id: 'summary-section',
          title: 'Key Metrics Summary',
          colorGroup: 'purple',
          children: [
            HStack({
              gap: spacing.lg,
              alignItems: 'stretch',
              children: [
                VStack({
                  flex: 1,
                  gap: spacing.sm,
                  children: [
                    Text({ id: 'total-rev-label', text: 'Total 2025 Revenue', fontSize: typography.sub.fontSize, textColor: '#4A5568', width: 'fit-content' }),
                    Text({ id: 'total-rev-value', text: '**$2.03B**', fontSize: typography.h2.fontSize, textColor: '#5A67D8', width: 'fit-content' }),
                  ]
                }),
                VStack({
                  flex: 1,
                  gap: spacing.sm,
                  children: [
                    Text({ id: 'yoy-growth-label', text: 'YoY Growth', fontSize: typography.sub.fontSize, textColor: '#4A5568', width: 'fit-content' }),
                    Text({ id: 'yoy-growth-value', text: '**+42.8%**', fontSize: typography.h2.fontSize, textColor: '#48BB78', width: 'fit-content' }),
                  ]
                }),
                VStack({
                  flex: 1,
                  gap: spacing.sm,
                  children: [
                    Text({ id: 'users-label', text: 'Total Active Users', fontSize: typography.sub.fontSize, textColor: '#4A5568', width: 'fit-content' }),
                    Text({ id: 'users-value', text: '**2.1M**', fontSize: typography.h2.fontSize, textColor: '#805AD5', width: 'fit-content' }),
                  ]
                }),
              ]
            }),
          ]
        }),
      ]
    })
  ]
});

console.log(JSON.stringify(doc, null, 2));