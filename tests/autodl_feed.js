#!/usr/bin/env node

//autodl calls this as a "program", and should feed it arguments, let us check
const fs = require('fs');
const path = require('path');
const add_torrent = require('../build/add_torrent');

let args = process.argv.slice(2);
fs.appendFileSync(path.join(__dirname, 'log.txt'), `${args.join(',')}\n`);
add_torrent(args);