# Video Podcast Maker 🎙️

Automated pipeline to create professional video podcasts from a topic. **Optimized for Bilibili (B站)**.

[English](README.md) | [中文](README_CN.md)

## Features

- **14 步全自动工作流** - 从话题到 4K 视频
- **MiniMax LLM 集成** - 智能研究和脚本生成
- **Remotion Studio** - 可视化预览和编辑
- **多 TTS 提供商** - Azure Speech / CosyVoice
- **B站深度优化** - 章节时间戳、双比例封面
- **4K 输出** + 背景音乐混音

## 快速开始

### 安装

```bash
# Clone 项目
git clone https://github.com/illli-studio/video-podcast-maker.git
cd video-podcast-maker

# 安装依赖
npm install

# 链接到全局
npm link
```

### 配置

```bash
video-podcast-maker config
# 选择 "Set Azure API key" 或 "Set CosyVoice API key"
```

或者设置环境变量：

```bash
export AZURE_SPEECH_KEY=your_key
export AZURE_SPEECH_REGION=eastus
export MINIMAX_API_KEY=your_minimax_key
```

### 使用

```bash
# 1. 初始化项目
video-podcast-maker init my-video
cd my-video

# 2. 运行工作流 (自动研究 + 生成脚本)
video-podcast-maker workflow

# 3. 生成配音
video-podcast-maker tts

# 4. 预览视频
video-podcast-maker preview

# 5. 渲染最终视频
video-podcast-maker render
```

## 命令列表

| 命令 | 简写 | 功能 |
|------|------|------|
| `init [name]` | `i` | 初始化新项目 |
| `workflow` | `w` | 运行完整工作流 |
| `tts` | `t` | 生成配音 |
| `preview` | `p` | 浏览器预览 |
| `render` | `r` | 渲染视频 |
| `config` | `c` | 配置管理 |

## 工作流

```
用户输入主题
     ↓
🔍 主题研究 (MiniMax)
     ↓
✍️ 生成脚本 (MiniMax)
     ↓
🎙️ TTS 配音生成
     ↓
🎬 Remotion 视频渲染
     ↓
📺 4K 视频输出
```

## 项目结构

```
video-podcast-maker/
├── bin/
│   └── cli.js              # CLI 入口
├── src/
│   ├── commands/
│   │   ├── init.js        # 初始化
│   │   ├── workflow.js    # 工作流
│   │   ├── tts.js        # 配音
│   │   ├── preview.js    # 预览
│   │   ├── render.js     # 渲染
│   │   └── config.js     # 配置
│   └── lib/
│       ├── workflow.js    # 工作流核心 (含 MiniMax 集成)
│       └── tts.js        # TTS 核心
├── templates/            # 视频模板
├── generate_tts.py      # Python TTS 脚本
└── package.json
```

## 配置选项

### Azure Speech

```bash
video-podcast-maker config
# → Set Azure API key
```

### CosyVoice (阿里云)

```bash
video-podcast-maker config
# → Set CosyVoice API key
```

### MiniMax (用于脚本生成)

设置环境变量：

```bash
export MINIMAX_API_KEY=your_key
```

## B站优化

- 封面自动生成 (16:9 + 4:3)
- 章节时间戳 (`MM:SS` 格式)
- 一键三连引导
- 高信息密度布局

## 开发

```bash
# 运行测试
npm test

# 开发模式
npm run test:watch
```

## 技术栈

- **Node.js 18+** - CLI
- **Python 3.8+** - TTS
- **MiniMax API** - LLM 脚本生成
- **Remotion** - 视频渲染
- **FFmpeg** - 音频处理
- **Azure Speech / CosyVoice** - 语音合成

## License

MIT © illli-studio
