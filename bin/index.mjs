#!/usr/bin/env node

import { Command } from 'commander';
import { makeConfigIfNotExist } from '../build/utils/directory.js';

makeConfigIfNotExist();

const program = new Command();

program.command('validate').description(`Validate that you've configured qbit-race correctly`).action(() => {
    console.log(`TODO: Load config etc.`);
})

// console.log(`This will be the cli in future!!!`);

program.parse();