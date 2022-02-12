#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setLogfile } from '../build/config.js'
import add_torrent from '../build/add_torrent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//Create logs folder if it doesnt exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

setLogfile('pre_race.log');

let args = process.argv.slice(2);
await add_torrent(args);