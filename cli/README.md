# Video Podcast Maker CLI

🎙️ Automated pipeline to create professional video podcasts from a topic. **Optimized for Bilibili (B站)**.

## Features

- **14 步全自动工作流** - 从话题到 4K 视频
- **Remotion Studio** - 可视化编辑
- **Azure TTS** - 高质量中英文配音
- **B站深度优化** - 章节时间戳、双比例封面
- **4K 输出** + 背景音乐混音

## 安装

```bash
# Clone 项目
git clone https://github.com/Agents365-ai/video-podcast-maker.git
cd video-podcast-maker/cli

# 安装依赖
npm install

# 链接到全局
npm link
```

## 使用方法

### 1. 初始化项目

```bash
video-podcast-maker init my-video
cd my-video
```

### 2. 配置 TTS

```bash
video-podcast-maker config
# 选择 "Set Azure API key" 输入你的 API Key
```

### 3. 运行工作流

```bash
video-podcast-maker workflow
```

按照提示输入视频主题，CLI 会自动：
1. 调研话题
2. 生成脚本
3. 生成配音
4. 渲染视频

### 4. 单独命令

```bash
# 仅生成 TTS
video-podcast-maker tts

# 仅渲染视频
video-podcast-maker render

# 配置管理
video-podcast-maker config
```

## 命令列表

| 命令 | 功能 |
|------|------|
| `init [name]` | 初始化新项目 |
| `workflow` | 运行完整工作流 |
| `tts` | 生成配音 |
| `render` | 渲染视频 |
| `config` | 配置管理 |

## B站优化

- 封面自动生成 (16:9 + 4:3)
- 章节时间戳
- 一键三连引导
- 高信息密度布局

## 技术栈

- Node.js 18+ (CLI)
- Python 3.8+ (TTS)
- Remotion (视频渲染)
- FFmpeg (音频处理)
- Azure Speech / CosyVoice (语音合成)

## License

MIT
