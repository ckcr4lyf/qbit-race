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

// const autodlLogPath = path.join(logsDir, 'autodl.log');

// //Called with insufficient arguments
// if (process.argv.length !== 6){
//     fs.appendFileSync(autodlLogPath, `BAD AUTODL CALL - ${process.argv.join(',')}\n`);
//     process.exit(1);
// } else {
//     fs.appendFileSync(autodlLogPath, `GOOD AUTODL CALL - ${process.argv.join(',')}\n`);
// }

import { setLogfile } from '../build/config.js';
setLogfile('pre_race.log');
import { add_torrent } from '../build/add_torrent.js';
let args = process.argv.slice(2);
add_torrent(args);