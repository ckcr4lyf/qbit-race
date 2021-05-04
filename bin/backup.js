#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

const { setLogfile } = require('../build/config');
setLogfile('backup.log');

const { backupCurrentConfig } = require('../build/helpers/backup');
backupCurrentConfig();
