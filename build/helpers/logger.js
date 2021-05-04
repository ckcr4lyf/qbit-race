"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs = require("fs");
const config_1 = require("../config");
class Logger {
    constructor() { }
    log(level, msg) {
        const dateString = new Date().toISOString();
        const logString = `[${dateString}] ${level}: ${msg}\n`;
        console.log(logString.trim());
        fs.appendFileSync(config_1.LOGFILE, logString);
    }
    info(msg) {
        this.log('INFO', msg);
    }
    error(msg) {
        this.log('ERROR', msg);
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map