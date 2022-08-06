#!/usr/bin/env node

import { Command } from 'commander';
import { makeConfigIfNotExist } from '../build/utils/directory.js';
import { getLoggerV3} from '../build/utils/logger.js'

const logger = getLoggerV3();
logger.info(`Starting...`);

makeConfigIfNotExist();

const program = new Command();

program.command('validate').description(`Validate that you've configured qbit-race correctly`).action(() => {
    console.log(`TODO: Load config etc.`);
})

// console.log(`This will be the cli in future!!!`);

program.parse();