#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

//Create logs folder if it doesnt exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

const { setLogfile } = require('../build/config');
setLogfile('tag_errored.log');
const { tagErroredTorrents } = require('../build/tag_error');
const args = process.argv.slice(2);
tagErroredTorrents(args);