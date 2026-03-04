import { Command } from 'commander';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const init = new Command('init')
  .description('Initialize a new video podcast project');

init
  .argument('[name]', 'Project name', 'my-video-podcast')
  .action(async (name) => {
    console.log(`🎬 Initializing project: ${name}\n`);
    
    // Create project directory
    const projectPath = path.resolve(name);
    if (fs.existsSync(projectPath)) {
      console.error(`Error: Directory ${name} already exists`);
      process.exit(1);
    }
    
    fs.mkdirSync(projectPath, { recursive: true });
    
    // Create Remotion project
    console.log('📦 Creating Remotion project...');
    try {
      execSync('npx create-video@latest . --template blank', {
        stdio: 'inherit',
        cwd: projectPath
      });
    } catch (e) {
      console.log('Manual setup required...');
    }
    
    // Copy templates
    const cliPath = path.dirname(path.dirname(path.dirname(import.meta.url pathname)));
    const templatesSrc = path.join(cliPath, 'templates');
    
    if (fs.existsSync(templatesSrc)) {
      const srcDir = path.join(projectPath, 'src');
      if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
      }
      
      // Copy Video.tsx
      const videoSrc = path.join(templatesSrc, 'Video.tsx');
      if (fs.existsSync(videoSrc)) {
        fs.copyFileSync(videoSrc, path.join(srcDir, 'Video.tsx'));
      }
      
      // Copy Root.tsx
      const rootSrc = path.join(templatesSrc, 'Root.tsx');
      if (fs.existsSync(rootSrc)) {
        fs.copyFileSync(rootSrc, path.join(srcDir, 'Root.tsx'));
      }
      
      // Copy Thumbnail.tsx
      const thumbSrc = path.join(templatesSrc, 'Thumbnail.tsx');
      if (fs.existsSync(thumbSrc)) {
        fs.copyFileSync(thumbSrc, path.join(srcDir, 'Thumbnail.tsx'));
      }
    }
    
    console.log(`\n✅ Project initialized: ${projectPath}`);
    console.log('\n📝 Next steps:');
    console.log(`  cd ${name}`);
    console.log('  video-podcast-maker workflow');
  });

export default init;
