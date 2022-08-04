#!/usr/bin/env node
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

//Create logs folder if it doesnt exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

import { setLogfile } from '../build/config.js';
setLogfile('tests.log');
import { add_torrent } from '../build/add_torrent.js';
let args = ["hash","Fake Name", "fake.tracker", "/home/poiasd/scripts/qbit-race/tests/sample.torrent", "--category", "test cat"];
add_torrent(args);