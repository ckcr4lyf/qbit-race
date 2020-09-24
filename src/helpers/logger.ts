import * as fs from 'fs';
import * as path from 'path';
import { TESTING } from '../config';

class Logger {

    logfile: string;

    constructor (logfile: string) {
        this.logfile = path.join(__dirname, '../../logs', logfile);

        // if (!TESTING){
        //     fs.appendFileSync(this.logfile, '\n');
        // }
    }

    log = (prefix: string, message: string) => {

        let timeString = new Date().toISOString();
        let logEntry = `${timeString} [${prefix}] - ${message}\n`;

        console.log(logEntry.trim());

        if (!TESTING){
            fs.appendFileSync(this.logfile, logEntry);
        }
    }
}

export const feedLogger = new Logger('feeder.log')