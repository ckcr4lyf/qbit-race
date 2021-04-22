"use strict";
/**
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupCurrentConfig = void 0;
const fs = require("fs");
const path = require("path");
const os_1 = require("os");
const logger_1 = require("./logger");
const backupCurrentConfig = () => {
    const log = new logger_1.Logger('backupCurrentConfig.log');
    const settingsPath = path.join(__dirname, '../../', 'settings.js');
    if (fs.existsSync(settingsPath) === false) {
        log.log('BACKUP', `settings.js not found! Path = ${settingsPath}`);
        return;
    }
    const backupFolderPath = path.join(os_1.homedir(), '.backup/qbit-race/');
    try {
        fs.mkdirSync(backupFolderPath, { recursive: true });
    }
    catch (error) {
        if (error.code !== 'EEXIST') {
            log.log('BACKUP', `Error occured when trying to create the directory. ${error.code}`);
        }
    }
    const backupFilePath = path.join(backupFolderPath, `${(new Date()).toISOString()}_settings.js`);
    fs.copyFileSync(settingsPath, backupFilePath);
    log.log('BACKUP', `Copied file to ${backupFilePath}`);
};
exports.backupCurrentConfig = backupCurrentConfig;
//# sourceMappingURL=backup.js.map