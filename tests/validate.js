#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkQbit } from '../build/check_qbit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//Create logs folder if it doesnt exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir) || !fs.lstatSync(logsDir).isDirectory()){
    fs.mkdirSync(logsDir);
}

await checkQbit();