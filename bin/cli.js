#!/usr/bin/env node

import { Command } from 'commander';
import workflow from '../src/commands/workflow.js';
import tts from '../src/commands/tts.js';
import render from '../src/commands/render.js';
import init from '../src/commands/init.js';
import config from '../src/commands/config.js';

const program = new Command();

program
  .name('video-podcast-maker')
  .description('🎙️ Automated pipeline to create professional video podcasts from a topic')
  .version('1.0.0');

program.addCommand(init);
program.addCommand(workflow);
program.addCommand(tts);
program.addCommand(render);
program.addCommand(config);

program.parse();
