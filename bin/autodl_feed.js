#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const add_torrent = require('../build/add_torrent');

//Create logs folder if it doesnt exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

//Called with insufficient arguments
if (process.argv.length !== 6){
    process.exit(1);
}

let args = process.argv.slice(2);
add_torrent(args);