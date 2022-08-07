#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig, makeConfigIfNotExist } from '../build/utils/directory.js';
import { loginV2 } from '../build/qbittorrent/auth.js';
import { getLoggerV3 } from '../build/utils/logger.js'

const logger = getLoggerV3();
logger.info(`Starting...`);

makeConfigIfNotExist();
const config = loadConfig();

const program = new Command();

program.command('validate').description(`Validate that you've configured qbit-race correctly`).action(async () => {
    logger.info(`Going to login`);
    try {
        await loginV2(config);
    } catch (e){
        logger.error(`Validation failed!`);
        process.exit(1);
    }
    // console.log(`TODO: Load config etc.`);
})

// console.log(`This will be the cli in future!!!`);

program.parse();