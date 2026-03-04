import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import os from 'os';

const config = new Command('config')
  .description('Manage configuration');

config
  .action(async () => {
    const configPath = path.join(os.homedir(), '.video-podcast-maker.json');
    
    // Load or create config
    let cfg = {};
    if (fs.existsSync(configPath)) {
      cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'View current config', value: 'view' },
          { name: 'Set Azure API key', value: 'azure' },
          { name: 'Set CosyVoice API key', value: 'cosyvoice' },
          { name: 'Set OpenAI API key (for script)', value: 'openai' },
          { name: 'Reset config', value: 'reset' }
        ]
      }
    ]);
    
    switch (action) {
      case 'view':
        console.log('\n📋 Current config:');
        console.log(JSON.stringify(cfg, null, 2));
        break;
        
      case 'azure':
        const { azureKey, azureRegion } = await inquirer.prompt([
          {
            type: 'input',
            name: 'azureKey',
            message: 'Enter Azure Speech API key:',
            validate: (input) => input.length > 0
          },
          {
            type: 'input',
            name: 'azureRegion',
            message: 'Enter Azure region:',
            default: 'eastus'
          }
        ]);
        cfg.azureSpeechKey = azureKey;
        cfg.azureSpeechRegion = azureRegion;
        fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
        console.log('✅ Azure config saved');
        break;
        
      case 'cosyvoice':
        const { cosyKey } = await inquirer.prompt([
          {
            type: 'input',
            name: 'cosyKey',
            message: 'Enter Alibaba Cloud API key:',
            validate: (input) => input.length > 0
          }
        ]);
        cfg.cosyVoiceKey = cosyKey;
        fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
        console.log('✅ CosyVoice config saved');
        break;
        
      case 'openai':
        const { openaiKey } = await inquirer.prompt([
          {
            type: 'input',
            name: 'openaiKey',
            message: 'Enter OpenAI API key:',
            validate: (input) => input.length > 0
          }
        ]);
        cfg.openaiKey = openaiKey;
        fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
        console.log('✅ OpenAI config saved');
        break;
        
      case 'reset':
        if (fs.existsSync(configPath)) {
          fs.unlinkSync(configPath);
        }
        console.log('✅ Config reset');
        break;
    }
  });

export default config;
