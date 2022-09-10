import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import { LOGFILE } from '../config.js';
class Logger {
    constructor() { }
    log(level, msg) {
        const dateString = new Date().toISOString();
        const logString = `[${dateString}] ${level}: ${msg}\n`;
        console.log(logString.trim());
        const logfile = path.join(__dirname, '../../logs', LOGFILE);
        fs.appendFileSync(logfile, logString);
    }
    info(msg) {
        this.log('INFO', msg);
    }
    error(msg) {
        this.log('ERROR', msg);
    }
}
export const logger = new Logger();
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
export const getLogger = (name) => {
    return new LoggerV2(name);
};
//# sourceMappingURL=logger.js.map