"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL_PATH = exports.HTTP_SCHEME = exports.DISCORD_WEBHOOK = exports.setLogfile = exports.LOGFILE = exports.setCookie = exports.COOKIE = exports.QBIT_USERNAME = exports.QBIT_PASSWORD = exports.QBIT_PORT = exports.QBIT_HOST = exports.PROM_PORT = exports.PROM_IP = void 0;
const dotenv = require("dotenv");
const path = require("path");
const settings_1 = require("../settings");
const logger_1 = require("./helpers/logger");
let COOKIE = '';
exports.COOKIE = COOKIE;
let LOGFILE = 'default.log';
exports.LOGFILE = LOGFILE;
dotenv.config({
    path: path.join(__dirname, '../.env')
});
const QBIT_HOST = process.env.QBIT_HOST;
exports.QBIT_HOST = QBIT_HOST;
const QBIT_PORT = process.env.QBIT_PORT;
exports.QBIT_PORT = QBIT_PORT;
const QBIT_USERNAME = process.env.QBIT_USERNAME;
exports.QBIT_USERNAME = QBIT_USERNAME;
const QBIT_PASSWORD = process.env.QBIT_PASSWORD;
exports.QBIT_PASSWORD = QBIT_PASSWORD;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
exports.DISCORD_WEBHOOK = DISCORD_WEBHOOK;
const HTTP_SCHEME = process.env.HTTP_SCHEME || 'http'; // Default to http
exports.HTTP_SCHEME = HTTP_SCHEME;
const URL_PATH = process.env.URL_PATH || ''; // Empty string, access straight at /api
exports.URL_PATH = URL_PATH;
// Address to bind to to serve prometheus metrics
exports.PROM_IP = process.env.PROM_IP || '127.0.0.1';
exports.PROM_PORT = process.env.PROM_PORT || '9999';
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
if (!DISCORD_WEBHOOK && settings_1.SETTINGS.DISCORD_NOTIFICATIONS.enabled === true) {
    console.log("Please define DISCORD_WEBHOOK in your .env file. (Discord notifications are enabled but a webhook is not defined)\n");
    process.exit(1);
}
const setCookie = (cookie) => {
    exports.COOKIE = COOKIE = cookie;
    logger_1.logger.info(`Updated COOKIE!`);
};
exports.setCookie = setCookie;
//logger.ts will get the LOGFILE from config.ts to decide which file to write to.
//Different entrypoints may want to use setLogFile() to change the value of that variable
//Then the next time something is logged, it will be done so to the new file. 
//This was, for feeder we can set one log, for post race another. 
//Potentially more logs for testing and shit.
const setLogfile = (logfile) => {
    exports.LOGFILE = LOGFILE = logfile;
};
exports.setLogfile = setLogfile;
//# sourceMappingURL=config.js.map