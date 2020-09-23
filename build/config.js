"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTesting = exports.TESTING = exports.setCookie = exports.COOKIE = exports.QBIT_USERNAME = exports.QBIT_PASSWORD = exports.QBIT_PORT = exports.QBIT_HOST = void 0;
const dotenv = require("dotenv");
const path = require("path");
const logger_1 = require("./helpers/logger");
dotenv.config({
    path: path.join(__dirname, '../.env')
});
logger_1.feedLogger.log('CONFIG', 'Loaded .env');
const QBIT_HOST = process.env.QBIT_HOST;
exports.QBIT_HOST = QBIT_HOST;
const QBIT_PORT = process.env.QBIT_PORT;
exports.QBIT_PORT = QBIT_PORT;
const QBIT_USERNAME = process.env.QBIT_USERNAME;
exports.QBIT_USERNAME = QBIT_USERNAME;
const QBIT_PASSWORD = process.env.QBIT_PASSWORD;
exports.QBIT_PASSWORD = QBIT_PASSWORD;
let COOKIE = '';
exports.COOKIE = COOKIE;
let TESTING = false;
exports.TESTING = TESTING;
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
const setCookie = (cookie) => {
    exports.COOKIE = COOKIE = cookie;
    logger_1.feedLogger.log(`CONFIG`, `Updated COOKIE to ${cookie}`);
};
exports.setCookie = setCookie;
const setTesting = (valid) => {
    exports.TESTING = TESTING = valid;
};
exports.setTesting = setTesting;
//# sourceMappingURL=config.js.map