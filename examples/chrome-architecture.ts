import { setTheme, spacing, typography } from './src/theme.js';
import { Whiteboard, VStack, HStack, Text, Connector } from './src/primitives.js';
import { Card, IconCard, Section, Divider, BulletList } from './src/composites.js';

setTheme('classic');

const doc = Whiteboard({
  theme: 'classic',
  children: [
    VStack({
      id: 'root',
      width: 1400,
      gap: spacing.xl,
      padding: spacing.xxl,
      fillColor: '#F8FAFC',
      children: [
        // Title
        Text({
          id: 'title',
          text: '**Google Chrome Multi-Process Architecture**',
          fontSize: typography.h1.fontSize,
          textColor: '#1F2329',
          width: 'fit-content',
          height: 'fit-content',
        }),
        
        // Browser Process
        Section({
          id: 'browser-process',
          title: 'Browser Process (浏览器主进程)',
          colorGroup: 'blue',
          children: [
            HStack({
              gap: spacing.md,
              alignItems: 'stretch',
              children: [
                IconCard({ id: 'ui-thread', icon: 'window', title: '**UI Thread**', subtitle: '绘制浏览器控件 (地址栏、书签、前进后退)' }),
                IconCard({ id: 'network-thread', icon: 'cloud', title: '**Network Thread**', subtitle: '处理 HTTP/HTTPS 网络请求 (现已逐渐剥离为独立进程)' }),
                IconCard({ id: 'storage-thread', icon: 'database', title: '**Storage Thread**', subtitle: '控制文件访问、Cookie 和本地存储' }),
                IconCard({ id: 'io-thread', icon: 'swap', title: '**I/O Thread**', subtitle: '处理与其他进程的 IPC 和 Mojo 通信' }),
              ]
            })
          ]
        }),

        // IPC Divider
        Divider({ label: 'Mojo / IPC Communication (进程间通信)', thickness: 2 }),

        // Sub Processes
        HStack({
          gap: spacing.lg,
          alignItems: 'stretch',
          children: [
            // Renderer Process
            VStack({
              flex: 2,
              gap: spacing.md,
              children: [
                Section({
                  id: 'renderer-process',
                  title: 'Renderer Process (渲染进程 - 每标签页一个)',
                  colorGroup: 'green',
                  children: [
                    HStack({
                      gap: spacing.md,
                      alignItems: 'stretch',
                      children: [
                        // Main Thread
                        Card({
                          id: 'main-thread',
                          title: '**Main Thread (主线程)**',
                          subtitle: '核心渲染逻辑',
                          children: [
                            BulletList({
                              items: [
                                '**Blink Engine**: 解析 HTML/CSS, 构建 DOM/CSSOM',
                                '**V8 Engine**: 编译和执行 JavaScript',
                                'Layout (布局) & Paint (绘制) 计算'
                              ]
                            })
                          ]
                        }),
                        // Other Threads
                        VStack({
                          flex: 1,
                          gap: spacing.md,
                          children: [
                            Card({ id: 'compositor-thread', title: '**Compositor Thread**', subtitle: '合成器线程，接收输入事件，分块(Tiling)' }),
                            Card({ id: 'raster-thread', title: '**Raster Thread**', subtitle: '光栅化线程，将图块转化为位图' }),
                            Card({ id: 'worker-thread', title: '**Worker Thread**', subtitle: 'Web Worker / Service Worker' }),
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            }),

            // GPU Process
            VStack({
              flex: 1,
              gap: spacing.md,
              children: [
                Section({
                  id: 'gpu-process',
                  title: 'GPU Process (GPU 进程)',
                  colorGroup: 'purple',
                  children: [
                    Card({
                      id: 'gpu-card',
                      title: '**GPU 硬件加速**',
                      subtitle: '跨进程共享的唯一 GPU 进程',
                      children: [
                        BulletList({
                          items: [
                            '接收来自渲染进程的合成帧',
                            '调用 OpenGL / Vulkan / Metal',
                            '最终输出到屏幕 (Display)'
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            }),

            // Utility Process
            VStack({
              flex: 1,
              gap: spacing.md,
              children: [
                Section({
                  id: 'utility-process',
                  title: 'Utility Process (实用程序进程)',
                  colorGroup: 'yellow',
                  children: [
                    Card({ id: 'network-service', title: '**Network Service**', subtitle: '独立化的网络服务进程' }),
                    Card({ id: 'audio-service', title: '**Audio Service**', subtitle: '音频解码与输出' }),
                    Card({ id: 'plugin-service', title: '**Plugin Process**', subtitle: '隔离的第三方插件运行环境' })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),

    // Connectors
    Connector({ id: 'c1', from: 'io-thread', to: 'renderer-process', variant: 'main', label: 'IPC', lineShape: 'rightAngle', fromAnchor: 'bottom', toAnchor: 'top' }),
    Connector({ id: 'c2', from: 'io-thread', to: 'gpu-card', variant: 'main', label: 'IPC', lineShape: 'rightAngle', fromAnchor: 'bottom', toAnchor: 'top' }),
    Connector({ id: 'c3', from: 'io-thread', to: 'utility-process', variant: 'secondary', lineShape: 'rightAngle', fromAnchor: 'bottom', toAnchor: 'top' }),
    Connector({ id: 'c4', from: 'compositor-thread', to: 'gpu-card', variant: 'main', label: '提交合成帧', lineShape: 'curve', fromAnchor: 'right', toAnchor: 'left' }),
  ]
});

console.log(JSON.stringify(doc, null, 2));