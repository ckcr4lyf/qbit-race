"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedLogger = void 0;
const fs = require("fs");
const path = require("path");
const config_1 = require("../config");
class Logger {
    constructor(logfile) {
        this.log = (prefix, message) => {
            let timeString = new Date().toISOString();
            let logEntry = `${timeString} [${prefix}] - ${message}\n`;
            console.log(logEntry.trim());
            if (!config_1.TESTING) {
                fs.appendFileSync(this.logfile, logEntry);
            }
        };
        this.logfile = path.join(__dirname, '../../logs', logfile);
        // if (!TESTING){
        //     fs.appendFileSync(this.logfile, '\n');
        // }
    }
}
exports.feedLogger = new Logger('feeder.log');
//# sourceMappingURL=logger.js.map