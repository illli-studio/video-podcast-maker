import { Command } from 'commander';
import inquirer from 'inquirer';
import { generateTTS } from '../lib/tts.js';
import fs from 'fs';
import path from 'path';

const tts = new Command('tts')
  .description('Generate text-to-speech audio');

tts
  .option('-s, --script <path>', 'Script JSON file path', './output/script.json')
  .option('-v, --voice <voice>', 'Voice name (azure/cosyvoice)')
  .action(async (options) => {
    console.log('🎙️ Generating TTS...\n');
    
    // Load script
    let script;
    try {
      const scriptPath = path.resolve(options.script);
      script = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));
    } catch (e) {
      console.error('❌ Error: Could not load script.json');
      console.log('Run: video-podcast-maker workflow first');
      process.exit(1);
    }
    
    // Get voice if not specified
    let voice = options.voice;
    if (!voice) {
      const { voice: selectedVoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'voice',
          message: 'Select TTS provider:',
          choices: [
            { name: 'Azure Speech (recommended)', value: 'azure' },
            { name: 'CosyVoice (Alibaba Cloud)', value: 'cosyvoice' }
          ]
        }
      ]);
      voice = selectedVoice;
    }
    
    // Generate TTS
    console.log(`Using: ${voice} TTS`);
    const audioFiles = await generateTTS(script, voice);
    
    console.log(`\n✅ Generated ${audioFiles.length} audio files`);
    console.log('Output directory: ./output/audio/');
  });

export default tts;
