import * as dotenv from 'dotenv'
import * as path from 'path';

import { feedLogger } from './helpers/logger';

dotenv.config({
    path: path.join(__dirname, '../.env')
});

feedLogger.log('CONFIG', 'Loaded .env');

const QBIT_HOST = process.env.QBIT_HOST;
const QBIT_PORT = process.env.QBIT_PORT;
const QBIT_USERNAME = process.env.QBIT_USERNAME;
const QBIT_PASSWORD = process.env.QBIT_PASSWORD;
let COOKIE = '';
let TESTING = false;

if (!QBIT_HOST){
    console.log("Please define QBIT_HOST in your .env file.");
    process.exit(1);
}

if (!QBIT_PORT){
    console.log("Please define QBIT_PORT in your .env file.");
    process.exit(1);
}

if (!QBIT_USERNAME){
    console.log("Please define QBIT_USERNAME in your .env file.");
    process.exit(1);
}

if (!QBIT_PASSWORD){
    console.log("Please define QBIT_PASSWORD in your .env file.");
    process.exit(1);
}

const setCookie = (cookie: string) => {
    COOKIE = cookie;
    feedLogger.log(`CONFIG`, `Updated COOKIE!`);// to ${cookie}`);
}

const setTesting = (valid: boolean) => {
    TESTING = valid;
}

export { QBIT_HOST, QBIT_PORT, QBIT_PASSWORD, QBIT_USERNAME, COOKIE, setCookie, TESTING, setTesting }