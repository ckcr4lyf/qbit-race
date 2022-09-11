import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
class LoggerV2 {

    private name;

    constructor(name: string) {
        this.name = name;
    }

    private log(level: string, msg: string){
        const dateString = new Date().toISOString();
        const logString = `[${dateString}] ${level}: ${msg}\n`;
        console.log(logString.trim());
        const logfile = path.join(__dirname, '../../logs', `${this.name}.log`);
        fs.appendFileSync(logfile, logString);
    }

    public info(msg: string){
        this.log('INFO', msg);
    }

    public error(msg: string){
        this.log('ERROR', msg);
    }
}

export const getLogger = (name: string): LoggerV2 => {
    return new LoggerV2(name);
}