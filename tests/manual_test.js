#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setLogfile } from '../build/config.js';
import add_torrent from '../build/add_torrent.js';

//Create logs folder if it doesnt exist
const logsDir = fileURLToPath(new URL('../logs', import.meta.url));
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

setLogfile('tests.log');
let args = ["hash","Fake Name", "fake.tracker", "/home/poiasd/scripts/qbit-race/tests/sample.torrent", "--category", "test cat"];
add_torrent(args);