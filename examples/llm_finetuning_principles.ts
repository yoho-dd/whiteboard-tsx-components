import { setTheme, spacing } from '../src/theme.js';
import { Whiteboard, HStack, Connector, VStack } from '../src/primitives.js';
import {
  Badge,
  Card,
  DetailCard,
  Table,
  BulletList,
  Legend,
  Figure,
  Callout,
  IconCard,
  Pipeline,
} from '../src/composites.js';
import { ArchitectureTemplate } from '../src/templates.js';

// ❶ 设置商务专业主题
setTheme('business');

const doc = Whiteboard({
  theme: 'business',
  children: [
    Figure({
      label: 'LLM-FT-01',
      title: '大模型微调 (Fine-tuning) 技术原理全景图',
      caption: '本图展示了从基础模型到特定领域适配模型的演进路径，重点突出了 PEFT (参数高效微调) 特别是 LoRA 的核心原理。',
      children: [
        // 顶部辅助层：图例与核心提示
        HStack({
          gap: spacing.lg,
          alignItems: 'start',
          children: [
            Legend({
              title: '技术图例',
              direction: 'vertical',
              items: [
                { color: '#5178C6', label: '核心架构 / 模型' },
                { color: '#509863', label: '数据资产 / 输入' },
                { color: '#8E5CB6', label: '微调策略 / 算法' },
                { color: '#D4B45B', label: '训练过程 / 评估' },
              ],
            }),
            Callout({
              variant: 'info',
              title: '核心洞察：为何微调？',
              body: '预训练模型具备通用知识，微调则是为了注入**领域知识**、**对齐人类指令**并**降低推理幻觉**。',
            }),
          ],
        }),

        // 使用 ArchitectureTemplate 快速构建分层架构
        ArchitectureTemplate({
          id: 'finetuning-arch',
          width: 1100,
          layers: [
            {
              id: 'layer-data',
              title: '1. 数据与对齐层 (Data & Alignment)',
              label: 'Input Assets',
              colorGroup: 'green',
              nodes: [
                {
                  id: 'sft-data',
                  component: DetailCard({
                    id: 'sft-card',
                    icon: 'database',
                    title: '**指令微调数据 (SFT)**',
                    subtitle: 'Instruction / Question-Answer',
                    entries: [
                      { key: '多样性', value: 'High' },
                      { key: '质量', value: 'Golden Set' },
                    ],
                    children: [
                      BulletList({
                        items: ['多轮对话样本', '思维链 (CoT) 数据', '逻辑推理与代码'],
                      }),
                    ],
                    footer: [Badge({ text: '必选', colorGroup: 'green' })],
                  }),
                },
                {
                  id: 'rlhf-data',
                  component: DetailCard({
                    id: 'rlhf-card',
                    icon: 'star',
                    title: '**偏好对齐数据 (RLHF)**',
                    subtitle: 'PPO / DPO / ORPO',
                    entries: [{ key: '类型', value: 'Preference Pairs' }],
                    children: [
                      BulletList({
                        items: ['人类排序反馈', '安全与合规对齐', '有用性 (Helpfulness)'],
                      }),
                    ],
                  }),
                },
              ],
            },
            {
              id: 'layer-base',
              title: '2. 基础模型层 (Foundation Model)',
              label: 'Base LLM',
              colorGroup: 'blue',
              nodes: [
                {
                  id: 'foundation-model',
                  component: DetailCard({
                    id: 'base-card',
                    icon: 'cpu',
                    title: '**预训练基础模型**',
                    subtitle: 'Pre-trained Weights (Frozen)',
                    entries: [
                      { key: '架构', value: 'Transformer Only' },
                      { key: '参数', value: '7B / 14B / 70B+' },
                    ],
                    children: [
                      HStack({
                        gap: spacing.sm,
                        children: [
                          IconCard({ icon: 'activity', title: 'LLaMA-3', direction: 'vertical' }),
                          IconCard({ icon: 'activity', title: 'Qwen-2', direction: 'vertical' }),
                          IconCard({ icon: 'activity', title: 'Gemma-2', direction: 'vertical' }),
                        ],
                      }),
                    ],
                    footer: [Badge({ text: '参数冻结', colorGroup: 'blue' })],
                  }),
                },
              ],
            },
            {
              id: 'layer-peft',
              title: '3. 微调技术路径 (Fine-tuning Strategies)',
              label: 'PEFT vs Full',
              colorGroup: 'purple',
              direction: 'horizontal',
              nodes: [
                {
                  id: 'full-ft',
                  component: Card({
                    id: 'full-ft-card',
                    title: '全参数微调 (Full FT)',
                    subtitle: 'Update All Parameters',
                    children: [
                      Badge({ text: '昂贵', colorGroup: 'red' }),
                      Badge({ text: '易灾难性遗忘', colorGroup: 'yellow' }),
                    ],
                  }),
                },
                {
                  id: 'peft-lora',
                  component: DetailCard({
                    id: 'lora-card',
                    icon: 'zap',
                    title: '**LoRA (低秩自适应)**',
                    subtitle: 'Mainstream PEFT Method',
                    entries: [
                      { key: 'Rank (r)', value: '8 / 16 / 32' },
                      { key: 'Alpha', value: '16 / 32 / 64' },
                    ],
                    children: [
                      Table({
                        headers: ['组件', '状态', '作用'],
                        rows: [
                          ['Frozen Weights', '冻结', '保留通用知识'],
                          ['A/B Matrices', '可训练', '注入领域知识'],
                        ],
                        striped: true,
                      }),
                    ],
                    footer: [Badge({ text: '推荐方案', colorGroup: 'green' })],
                  }),
                },
                {
                  id: 'peft-other',
                  component: VStack({
                    gap: spacing.sm,
                    children: [
                      Card({ id: 'p-tuning', title: 'P-Tuning / Prefix' }),
                      Card({ id: 'adapter', title: 'Adapter Modules' }),
                    ],
                  }),
                },
              ],
            },
            {
              id: 'layer-delivery',
              title: '4. 训练、评估与交付 (Delivery)',
              label: 'Iterate',
              colorGroup: 'yellow',
              nodes: [
                {
                  id: 'pipeline',
                  component: Pipeline({
                    steps: [
                      { id: 'train', title: '训练迭代', icon: 'refresh', subtitle: '损失函数收敛' },
                      { id: 'eval', title: '基准评测', icon: 'check-circle', subtitle: 'MMLU / GSM8K' },
                      { id: 'deploy', title: '量化部署', icon: 'rocket', subtitle: 'FP16 -> INT4' },
                    ],
                  }),
                },
              ],
            },
          ],
        }),

        // 连线定义逻辑流
        Connector({
          from: 'sft-card',
          to: 'base-card',
          fromAnchor: 'bottom',
          toAnchor: 'top',
          variant: 'main',
          lineShape: 'rightAngle',
        }),
        Connector({
          from: 'base-card',
          to: 'lora-card',
          fromAnchor: 'bottom',
          toAnchor: 'top',
          variant: 'main',
          lineShape: 'rightAngle',
        }),
        Connector({
          from: 'lora-card',
          to: 'train',
          fromAnchor: 'bottom',
          toAnchor: 'top',
          variant: 'main',
          lineShape: 'rightAngle',
        }),
        Connector({
          from: 'full-ft-card',
          to: 'train',
          fromAnchor: 'bottom',
          toAnchor: 'top',
          variant: 'secondary',
          lineShape: 'curve',
          lineStyle: 'dashed',
        }),
      ],
    }),
  ],
});

console.log(JSON.stringify(doc, null, 2));
