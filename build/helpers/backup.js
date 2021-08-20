/**
 *
 */
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { logger } from './logger.js';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const backupCurrentConfig = () => {
    const settingsPath = path.join(__dirname, '../../', 'settings.js');
    if (fs.existsSync(settingsPath) === false) {
        logger.error(`settings.js not found! Path = ${settingsPath}`);
        return;
    }
    const backupFolderPath = path.join(homedir(), '.backup/qbit-race/');
    try {
        fs.mkdirSync(backupFolderPath, { recursive: true });
    }
    catch (error) {
        if (error.code !== 'EEXIST') {
            logger.error(`Error occured when trying to create the directory. ${error.code}`);
        }
    }
    const backupFilePath = path.join(backupFolderPath, `${(new Date()).getTime()}_settings.js`);
    fs.copyFileSync(settingsPath, backupFilePath);
    logger.info(`Copied file to ${backupFilePath}`);
};
//# sourceMappingURL=backup.js.map