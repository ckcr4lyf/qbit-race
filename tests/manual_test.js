#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

//Create logs folder if it doesnt exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

const { setLogfile } = require('../build/config');
setLogfile('tests.log');
const add_torrent = require('../build/add_torrent');
let args = ["hash","Fake Name", "fake.tracker", "/home/poiasd/scripts/qbit-race/tests/sample.torrent", "--category", "test cat"];
add_torrent(args);