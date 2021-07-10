"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = exports.logger = void 0;
const fs = require("fs");
const path = require("path");
const config_1 = require("../config");
class Logger {
    constructor() { }
    log(level, msg) {
        const dateString = new Date().toISOString();
        const logString = `[${dateString}] ${level}: ${msg}\n`;
        console.log(logString.trim());
        const logfile = path.join(__dirname, '../../logs', config_1.LOGFILE);
        fs.appendFileSync(logfile, logString);
    }
    info(msg) {
        this.log('INFO', msg);
    }
    error(msg) {
        this.log('ERROR', msg);
    }
}
exports.logger = new Logger();
class LoggerV2 {
    constructor(name) {
        this.name = name;
    }
    log(level, msg) {
        const dateString = new Date().toISOString();
        const logString = `[${dateString}] ${level}: ${msg}\n`;
        console.log(logString.trim());
        const logfile = path.join(__dirname, '../../logs', `${this.name}.log`);
        fs.appendFileSync(logfile, logString);
    }
    info(msg) {
        this.log('INFO', msg);
    }
    error(msg) {
        this.log('ERROR', msg);
    }
}
const getLogger = (name) => {
    return new LoggerV2(name);
};
exports.getLogger = getLogger;
//# sourceMappingURL=logger.js.map