import { Command } from 'commander';
import inquirer from 'inquirer';
import { researchTopic, generateScript } from '../lib/workflow.js';
import fs from 'fs';
import path from 'path';

const workflow = new Command('workflow')
  .description('Run the complete video podcast workflow');

workflow
  .action(async () => {
    console.log('🎬 Video Podcast Maker - Workflow\n');
    
    // Step 1: Get topic
    const { topic } = await inquirer.prompt([
      {
        type: 'input',
        name: 'topic',
        message: 'Enter your video topic:',
        validate: (input) => input.length > 0 || 'Topic cannot be empty'
      }
    ]);

    // Step 2: Research
    console.log('\n📚 Step 1: Researching topic...');
    const research = await researchTopic(topic);
    
    // Step 3: Generate script
    console.log('\n✍️ Step 2: Generating script...');
    const script = await generateScript(topic, research);
    
    // Step 4: Save script
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const scriptPath = path.join(outputDir, 'script.json');
    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));
    
    console.log(`\n✅ Script saved to: ${scriptPath}`);
    console.log('\n📝 Next steps:');
    console.log('  1. Run: video-podcast-maker tts');
    console.log('  2. Run: video-podcast-maker render');
  });

export default workflow;
