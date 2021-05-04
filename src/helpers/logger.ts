import * as fs from 'fs';
import { LOGFILE } from '../config';

class Logger {

    constructor () {}

    private log(level: string, msg: string){
        const dateString = new Date().toISOString();
        const logString = `[${dateString}] ${level}: ${msg}\n`;
        console.log(logString.trim());
        fs.appendFileSync(LOGFILE, logString);
    }

    public info(msg: string){
        this.log('INFO', msg);
    }

    public error(msg: string){
        this.log('ERROR', msg);
    }
}

export const logger = new Logger();