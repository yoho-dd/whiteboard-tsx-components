import { setTheme, spacing, typography } from '../src/theme.js';
import { Whiteboard, VStack, HStack, Text, Rect } from '../src/primitives.js';
import { Section, Legend, Divider } from '../src/composites.js';

// 使用科技暗色主题
setTheme('tech');

// 模拟股票数据（20根K线）
const data = [
  { date: '03-26', open: 110, high: 125, low: 105, close: 120 },
  { date: '03-27', open: 120, high: 130, low: 115, close: 125 },
  { date: '03-28', open: 125, high: 135, low: 120, close: 132 },
  { date: '03-29', open: 132, high: 140, low: 125, close: 128 },
  { date: '03-30', open: 128, high: 135, low: 115, close: 118 },
  { date: '04-01', open: 120, high: 135, low: 115, close: 130 },
  { date: '04-02', open: 130, high: 145, low: 125, close: 142 },
  { date: '04-03', open: 142, high: 150, low: 135, close: 138 },
  { date: '04-04', open: 138, high: 140, low: 110, close: 115 },
  { date: '04-05', open: 115, high: 125, low: 105, close: 122 },
  { date: '04-06', open: 122, high: 145, low: 120, close: 140 },
  { date: '04-07', open: 140, high: 165, low: 135, close: 160 },
  { date: '04-08', open: 160, high: 175, low: 155, close: 168 },
  { date: '04-09', open: 168, high: 170, low: 145, close: 150 },
  { date: '04-10', open: 150, high: 155, low: 130, close: 135 },
  { date: '04-11', open: 135, high: 145, low: 125, close: 142 },
  { date: '04-12', open: 142, high: 160, low: 140, close: 158 },
  { date: '04-13', open: 158, high: 180, low: 155, close: 175 },
  { date: '04-14', open: 175, high: 185, low: 165, close: 180 },
  { date: '04-15', open: 180, high: 195, low: 175, close: 190 },
];

const minPrice = 100;
const maxPrice = 200;
const priceRange = maxPrice - minPrice;
const chartHeight = 400;
const scale = chartHeight / priceRange;

// 构建 K 线组件
const klines = data.map((d, i) => {
  const isUp = d.close >= d.open;
  // 采用红色代表上涨，绿色代表下跌
  const color = isUp ? '#F6465D' : '#2EBD85';
  
  const topShadow = (d.high - Math.max(d.open, d.close)) * scale;
  const body = Math.max(2, Math.abs(d.open - d.close) * scale);
  const bottomShadow = (Math.min(d.open, d.close) - d.low) * scale;
  const spacer = (d.low - minPrice) * scale;
  
  return VStack({
    id: `kline-${i}`,
    gap: 0,
    alignItems: 'center',
    children: [
      // 上影线
      Rect({ id: `kline-${i}-top`, width: 2, height: Math.max(1, topShadow), fillColor: color, borderColor: color }),
      // 实体
      Rect({ id: `kline-${i}-body`, width: 14, height: body, fillColor: color, borderColor: color }),
      // 下影线
      Rect({ id: `kline-${i}-bottom`, width: 2, height: Math.max(1, bottomShadow), fillColor: color, borderColor: color }),
      // 底部占位（将蜡烛图推到正确的 Y 坐标高度）
      Rect({ id: `kline-${i}-spacer`, width: 14, height: Math.max(1, spacer), opacity: 0 }),
      // 日期文本（对齐基线）
      Rect({ id: `kline-${i}-gap`, width: 1, height: 8, opacity: 0 }),
      Text({ id: `kline-${i}-date`, text: d.date, fontSize: 10, textColor: '#787B86' })
    ]
  });
});

// 构建 Y 轴
const yAxis = VStack({
  id: 'y-axis-container',
  gap: 0,
  alignItems: 'end',
  children: [
    VStack({
      id: 'y-axis-labels',
      height: chartHeight,
      justifyContent: 'space-between',
      alignItems: 'end',
      children: [
        Text({ id: 'y-200', text: '200', fontSize: 10, textColor: '#787B86' }),
        Text({ id: 'y-180', text: '180', fontSize: 10, textColor: '#787B86' }),
        Text({ id: 'y-160', text: '160', fontSize: 10, textColor: '#787B86' }),
        Text({ id: 'y-140', text: '140', fontSize: 10, textColor: '#787B86' }),
        Text({ id: 'y-120', text: '120', fontSize: 10, textColor: '#787B86' }),
        Text({ id: 'y-100', text: '100', fontSize: 10, textColor: '#787B86' }),
      ]
    }),
    Rect({ id: 'y-axis-gap', width: 1, height: 8, opacity: 0 }),
    // 补齐日期的对齐高度
    Text({ id: 'y-axis-dummy', text: 'Price', fontSize: 10, textColor: '#787B86' })
  ]
});

const doc = Whiteboard({
  theme: 'tech',
  children: [
    VStack({
      id: 'root',
      width: 1100,
      gap: spacing.lg,
      padding: spacing.xl,
      fillColor: '#0B0E14', // 极客暗色背景
      children: [
        Text({
          id: 'title',
          text: '**AAPL - Apple Inc. (Daily K-Line Chart)**',
          fontSize: typography.h1.fontSize,
          textColor: '#E2E8F0',
          width: 'fit-content',
        }),
        
        Section({
          id: 'chart-section',
          title: 'Price Action (MOCK)',
          colorGroup: 'blue',
          children: [
            Legend({
              items: [
                { color: '#F6465D', label: 'Up (Close > Open)' },
                { color: '#2EBD85', label: 'Down (Close < Open)' },
              ]
            }),
            Divider({ color: '#1E222D', thickness: 2 }),
            HStack({
              id: 'chart-area',
              gap: 20,
              alignItems: 'end',
              children: [
                ...klines,
                // 右侧的 Y 轴
                yAxis
              ]
            })
          ]
        })
      ]
    })
  ]
});

console.log(JSON.stringify(doc, null, 2));