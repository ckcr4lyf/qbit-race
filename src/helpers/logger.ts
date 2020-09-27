import * as fs from 'fs';
import * as path from 'path';
import { LOGFILE } from '../config';

class Logger {

    logfile: string;

    constructor (logfile: string) {
        this.logfile = path.join(__dirname, '../../logs', logfile);
    }

    log = (prefix: string, message: string) => {
        let logfile = path.join(__dirname, '../../logs', LOGFILE); //Dynamically get the name from the environment / memory variable.
        let timeString = new Date().toISOString();
        let logEntry = `${timeString} [${prefix}] - ${message}\n`;
        console.log(logEntry.trim());
        fs.appendFileSync(logfile, logEntry);
    }
}

export const feedLogger = new Logger('feeder.log')