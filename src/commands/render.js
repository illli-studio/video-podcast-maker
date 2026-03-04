import { Command } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const render = new Command('render')
  .description('Render video with Remotion');

render
  .option('-c, --composition <name>', 'Composition name', 'Main')
  .option('-o, --output <path>', 'Output file path', './output/video.mp4')
  .option('-q, --quality <0-100>', 'Render quality', '80')
  .action(async (options) => {
    console.log('🎬 Rendering video...\n');
    
    // Check if audio exists
    const audioDir = './output/audio';
    if (!fs.existsSync(audioDir)) {
      console.error('❌ Error: No audio files found');
      console.log('Run: video-podcast-maker tts first');
      process.exit(1);
    }
    
    // Check if timing.json exists
    const timingPath = './output/timing.json';
    if (!fs.existsSync(timingPath)) {
      console.error('❌ Error: timing.json not found');
      console.log('Run: video-podcast-maker tts first');
      process.exit(1);
    }
    
    // Run Remotion render
    const outputPath = path.resolve(options.output);
    console.log(`Rendering to: ${outputPath}`);
    console.log('This may take a few minutes...\n');
    
    try {
      execSync(`npx remotion render src/index.ts ${options.composition} ${outputPath}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log(`\n✅ Video saved to: ${outputPath}`);
    } catch (e) {
      console.error('❌ Render failed');
      process.exit(1);
    }
  });

export default render;
