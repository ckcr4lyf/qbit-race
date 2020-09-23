#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const add_torrent = require('../build/add_torrent');
let args = ["d0d14c926e6e99761a2fdcff27b403d96376eff6","Fake Name", "fake.tracker", "/home/poiasd/scripts/qbit-race/tests/sample.torrent"];
add_torrent(args);
// args = ["d0d14c926e6e99761a2fdcff27b403d96376eff6","Fake Name", "mywaifu.best", "/home/poiasd/scripts/qbit-race/tests/sample.torrent"];
// add_torrent(args);