/**
 * 
 */

import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

import { Logger } from './logger';


export const backupCurrentConfig = () => {
    const log = new Logger('backupCurrentConfig.log');
    const settingsPath = path.join(__dirname, '../../', 'settings.js');

    if (fs.existsSync(settingsPath) === false){
        log.log('BACKUP', `settings.js not found! Path = ${settingsPath}`);
        return;
    }

    const backupFolderPath = path.join(homedir(), '.backup/qbit-race/');
    
    try {
        fs.mkdirSync(backupFolderPath, { recursive: true });
    } catch (error){
        if (error.code !== 'EEXIST'){
            log.log('BACKUP', `Error occured when trying to create the directory. ${error.code}`);
        }
    }

    const backupFilePath = path.join(backupFolderPath, `${(new Date()).getTime()}_settings.js`);
    fs.copyFileSync(settingsPath, backupFilePath);
    log.log('BACKUP', `Copied file to ${backupFilePath}`);
}