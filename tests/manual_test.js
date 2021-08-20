#!/usr/bin/env node
// const fs = require('fs');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// const path = require('path');

//Create logs folder if it doesnt exist
// const logsDir = path.join(__dirname, '../logs');
const logsDir = fileURLToPath(new URL('../logs', import.meta.url));
console.log(logsDir);
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

// const { setLogfile } = require('../build/config');
import { setLogfile } from '../build/config.js';
setLogfile('tests.log');
import add_torrent from '../build/add_torrent.js';
// const add_torrent = require('../build/add_torrent');
let args = ["hash","Fake Name", "fake.tracker", "/home/poiasd/scripts/qbit-race/tests/sample.torrent", "--category", "test cat"];
add_torrent(args);