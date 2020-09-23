#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

//Create logs folder if it doesnt exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

const check_qbit = require('../build/check_qbit');
check_qbit();