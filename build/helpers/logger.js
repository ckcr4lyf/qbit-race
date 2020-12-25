"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedLogger = exports.Logger = void 0;
const fs = require("fs");
const path = require("path");
const config_1 = require("../config");
class Logger {
    constructor(logfile) {
        this.log = (prefix, message) => {
            let logfile = path.join(__dirname, '../../logs', config_1.LOGFILE); //Dynamically get the name from the environment / memory variable.
            let timeString = new Date().toISOString();
            let logEntry = `${timeString} [${prefix}] - ${message}\n`;
            console.log(logEntry.trim());
            fs.appendFileSync(logfile, logEntry);
        };
        this.logfile = path.join(__dirname, '../../logs', logfile);
    }
}
exports.Logger = Logger;
exports.feedLogger = new Logger('feeder.log');
//# sourceMappingURL=logger.js.map