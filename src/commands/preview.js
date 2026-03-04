import { Command } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const preview = new Command('preview')
  .description('Preview video in browser with Remotion Studio');

preview
  .option('-p, --port <port>', 'Port number', '3000')
  .action(async (options) => {
    console.log('🎬 Starting video preview...\n');
    
    // Check if output exists
    const audioDir = './output/audio';
    if (!fs.existsSync(audioDir)) {
      console.error('❌ Error: No audio files found');
      console.log('Run: video-podcast-maker tts first');
      process.exit(1);
    }
    
    // Check timing.json
    const timingPath = './output/timing.json';
    if (!fs.existsSync(timingPath)) {
      console.error('❌ Error: timing.json not found');
      console.log('Run: video-podcast-maker tts first');
      process.exit(1);
    }
    
    // Check if src/index.ts exists
    const srcIndex = './src/index.ts';
    if (!fs.existsSync(srcIndex) && !fs.existsSync('./src/Video.tsx')) {
      console.error('❌ Error: No video source found');
      console.log('Run: video-podcast-maker init first');
      process.exit(1);
    }
    
    console.log(`🌐 Opening Remotion Studio on http://localhost:${options.port}`);
    console.log('Press Ctrl+C to stop\n');
    
    try {
      // Start Remotion Studio
      execSync(`npx remotion studio src/index.ts --port ${options.port}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (e) {
      // User cancelled or error
      console.log('\n👋 Preview stopped');
    }
  });

export default preview;
