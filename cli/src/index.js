#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('video-podcast-maker')
  .description('🎙️ Automated pipeline to create professional video podcasts from a topic')
  .version('1.0.0');

export default program;
