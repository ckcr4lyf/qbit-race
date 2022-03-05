import * as dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import * as path from 'path';
import { SETTINGS } from '../settings.js';
import { getLogger } from './helpers/logger.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let COOKIE = '';
let LOGFILE = 'default.log';
dotenv.config({
    path: path.join(__dirname, '../.env')
});
const QBIT_HOST = process.env.QBIT_HOST;
const QBIT_PORT = process.env.QBIT_PORT;
const QBIT_USERNAME = process.env.QBIT_USERNAME;
const QBIT_PASSWORD = process.env.QBIT_PASSWORD;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
const HTTP_SCHEME = process.env.HTTP_SCHEME || 'http'; // Default to http
const URL_PATH = process.env.URL_PATH || ''; // Empty string, access straight at /api
// Address to bind to to serve prometheus metrics
export const PROM_IP = process.env.PROM_IP || '127.0.0.1';
export const PROM_PORT = process.env.PROM_PORT || '9999';
if (!QBIT_HOST) {
    console.log("Please define QBIT_HOST in your .env file.");
    process.exit(1);
}
if (!QBIT_PORT) {
    console.log("Please define QBIT_PORT in your .env file.");
    process.exit(1);
}
if (!QBIT_USERNAME) {
    console.log("Please define QBIT_USERNAME in your .env file.");
    process.exit(1);
}
if (!QBIT_PASSWORD) {
    console.log("Please define QBIT_PASSWORD in your .env file.");
    process.exit(1);
}
if (!DISCORD_WEBHOOK && SETTINGS.DISCORD_NOTIFICATIONS.enabled === true) {
    console.log("Please define DISCORD_WEBHOOK in your .env file. (Discord notifications are enabled but a webhook is not defined)\n");
    process.exit(1);
}
const setCookie = (cookie, logFile) => {
    const logger = getLogger(logFile || 'COOKIE');
    COOKIE = cookie;
    logger.info(`Updated COOKIE!`);
};
//logger.ts will get the LOGFILE from config.ts to decide which file to write to.
//Different entrypoints may want to use setLogFile() to change the value of that variable
//Then the next time something is logged, it will be done so to the new file. 
//This was, for feeder we can set one log, for post race another. 
//Potentially more logs for testing and shit.
// This should be deprecated its a bad way to do it :ded:
const setLogfile = (logfile) => {
    LOGFILE = logfile;
};
export { QBIT_HOST, QBIT_PORT, QBIT_PASSWORD, QBIT_USERNAME, COOKIE, setCookie, LOGFILE, setLogfile, DISCORD_WEBHOOK, HTTP_SCHEME, URL_PATH };
//# sourceMappingURL=config.js.map