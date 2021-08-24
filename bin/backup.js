#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setLogfile } from '../build/config.js'
import { backupCurrentConfig } from '../build/helpers/backup.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

setLogfile('backup.log');

const { backupCurrentConfig } = require('../build/helpers/backup');
backupCurrentConfig();
