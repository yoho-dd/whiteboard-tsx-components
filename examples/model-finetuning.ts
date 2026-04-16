import { setTheme } from '../src/theme.js';
import {
  Whiteboard, VStack, HStack, Text, Connector,
} from '../src/primitives.js';
import { Card, Section, Figure, Callout, Legend, Pipeline, Badge, BulletList } from '../src/composites.js';
import { spacing, typography } from '../src/theme.js';

setTheme('classic');

const doc = Whiteboard({
  theme: 'classic',
  children: [
    Figure({
      label: 'Figure 1',
      title: '大语言模型微调技术原理图',
      caption: '展示 LLM 微调的完整技术流程：从预训练模型到微调后模型的全链路。包含数据准备、LoRA 适配器、训练过程与部署环节。',
      children: [
        VStack({
          id: 'root',
          width: 'fill-container',
          gap: spacing.lg,
          children: [
            HStack({
              gap: spacing.lg,
              alignItems: 'start',
              children: [
                Legend({
                  title: '图例',
                  direction: 'vertical',
                  items: [
                    { color: '#5178C6', label: '主数据流' },
                    { color: '#509863', label: '训练梯度' },
                    { color: '#D25D5A', label: '参数冻结' }
                  ]
                }),
                Callout({
                  id: 'innovation-note',
                  variant: 'success',
                  title: '核心特性：LoRA 高效微调',
                  body: '使用 **Low-Rank Adaptation** 技术，仅训练 0.1% 的参数，显著降低显存占用，保持预训练知识。'
                })
              ]
            }),
            Section({
              id: 'pipeline-section',
              title: '完整微调流程',
              colorGroup: 'blue',
              children: [
                Pipeline({
                  id: 'finetune-pipeline',
                  colorGroup: 'blue',
                  steps: [
                    {
                      id: 'pretrained',
                      title: '预训练模型',
                      icon: 'database',
                      subtitle: 'LLaMA / GPT / BERT',
                      children: [
                        Badge({ text: '~7B-70B 参数', colorGroup: 'purple' }),
                        Badge({ text: '冻结参数', colorGroup: 'red' })
                      ]
                    },
                    {
                      id: 'lora',
                      title: 'LoRA 适配器',
                      icon: 'zap',
                      subtitle: '低秩矩阵 (r=8/16)',
                      children: [
                        Badge({ text: '可训练', colorGroup: 'green' }),
                        Badge({ text: '仅 0.1%', colorGroup: 'green' })
                      ]
                    },
                    {
                      id: 'data',
                      title: '训练数据',
                      icon: 'file-text',
                      subtitle: '指令微调数据',
                      children: [
                        BulletList({
                          items: ['监督微调 (SFT)', '人类反馈 (RLHF)']
                        })
                      ]
                    },
                    {
                      id: 'training',
                      title: '训练过程',
                      icon: 'server',
                      subtitle: '反向传播优化',
                      children: [
                        BulletList({
                          items: ['AdamW 优化器', '梯度裁剪', '混合精度训练']
                        })
                      ]
                    },
                    {
                      id: 'deploy',
                      title: '部署上线',
                      icon: 'rocket',
                      subtitle: '推理服务',
                      children: [
                        BulletList({
                          items: ['权重合并', 'vLLM 推理', 'API 服务']
                        })
                      ]
                    }
                  ]
                })
              ]
            }),
            HStack({
              gap: spacing.lg,
              alignItems: 'stretch',
              children: [
                Section({
                  id: 'model-arch',
                  title: '模型架构',
                  colorGroup: 'purple',
                  children: [
                    VStack({
                      gap: spacing.md,
                      children: [
                        Card({
                          id: 'transformer',
                          title: '**Transformer 主干**',
                          subtitle: '多层注意力机制',
                          colorGroup: 'purple',
                          children: [Badge({ text: '冻结', colorGroup: 'red' })]
                        }),
                        Card({
                          id: 'adapter',
                          title: '**LoRA 适配器**',
                          subtitle: 'A + B 低秩矩阵',
                          colorGroup: 'green',
                          children: [Badge({ text: '可训练', colorGroup: 'green' })]
                        }),
                        Card({
                          id: 'output',
                          title: '**输出层**',
                          subtitle: '下一个 Token 预测',
                          colorGroup: 'blue'
                        })
                      ]
                    })
                  ]
                }),
                Section({
                  id: 'tech-details',
                  title: '技术参数',
                  colorGroup: 'green',
                  children: [
                    VStack({
                      gap: spacing.md,
                      children: [
                        Card({
                          id: 'hyperparams',
                          title: '**超参数配置**',
                          colorGroup: 'green',
                          children: [
                            BulletList({
                              items: [
                                '学习率: 3e-4',
                                'Batch Size: 8',
                                'LoRA Rank: 8',
                                'LoRA Alpha: 16'
                              ]
                            })
                          ]
                        }),
                        Card({
                          id: 'hardware',
                          title: '**硬件资源**',
                          colorGroup: 'yellow',
                          children: [
                            BulletList({
                              items: [
                                'GPU: 1 x A100 80GB',
                                '显存占用: ~24GB',
                                '训练时间: ~2-4 小时'
                              ]
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    Connector({ id: 'c-training-lora', from: 'training', to: 'adapter', variant: 'async', lineStyle: 'dashed', label: '更新梯度', endArrow: 'arrow', fromAnchor: 'bottom', toAnchor: 'top' }),
    Connector({ id: 'c-transformer-adapter', from: 'transformer', to: 'adapter', variant: 'secondary', endArrow: 'arrow', fromAnchor: 'bottom', toAnchor: 'top' }),
    Connector({ id: 'c-adapter-output', from: 'adapter', to: 'output', variant: 'main', endArrow: 'arrow', fromAnchor: 'bottom', toAnchor: 'top' })
  ],
});

console.log(JSON.stringify(doc, null, 2));
