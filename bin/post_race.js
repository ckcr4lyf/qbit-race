#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setLogfile } from '../build/config.js'
import { postRaceResume } from '../build/helpers/post_race_resume.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//Create logs folder if it doesnt exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

let infohash = '';
let tracker = '';

if (process.argv.length === 5){
    infohash = process.argv[2];
    tracker = process.argv[4];
}

setLogfile('post_race.log');
postRaceResume(infohash, tracker);