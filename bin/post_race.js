#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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

const { setLogfile } = require('../build/config');
setLogfile('post_race.log');
const { postRaceResume } = require('../build/helpers/post_race_resume');
postRaceResume(infohash, tracker);