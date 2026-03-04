#!/usr/bin/env node

import { program } from './src/index.js';
import workflow from './commands/workflow.js';
import tts from './commands/tts.js';
import render from './commands/render.js';
import init from './commands/init.js';
import config from './commands/config.js';

program.addCommand(init);
program.addCommand(workflow);
program.addCommand(tts);
program.addCommand(render);
program.addCommand(config);

program.parse();
