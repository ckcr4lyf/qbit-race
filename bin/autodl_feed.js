#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

//Create logs folder if it doesnt exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

const autodlLogPath = path.join(logsDir, 'autodl.log');

//Called with insufficient arguments
if (process.argv.length !== 6){
    fs.appendFileSync(autodlLogPath, `BAD AUTODL CALL - ${process.argv.join(',')}\n`);
    process.exit(1);
} else {
    fs.appendFileSync(autodlLogPath, `GOOD AUTODL CALL - ${process.argv.join(',')}\n`);
}

const add_torrent = require('../build/add_torrent');
let args = process.argv.slice(2);
add_torrent(args);