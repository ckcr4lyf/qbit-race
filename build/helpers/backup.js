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
    const settingsPath = path.join(__dirname, '../../', 'settings.js');
    if (fs.existsSync(settingsPath) === false) {
        logger_1.logger.error(`settings.js not found! Path = ${settingsPath}`);
        return;
    }
    const backupFolderPath = path.join((0, os_1.homedir)(), '.backup/qbit-race/');
    try {
        fs.mkdirSync(backupFolderPath, { recursive: true });
    }
    catch (error) {
        if (error.code !== 'EEXIST') {
            logger_1.logger.error(`Error occured when trying to create the directory. ${error.code}`);
        }
    }
    const backupFilePath = path.join(backupFolderPath, `${(new Date()).getTime()}_settings.js`);
    fs.copyFileSync(settingsPath, backupFilePath);
    logger_1.logger.info(`Copied file to ${backupFilePath}`);
};
exports.backupCurrentConfig = backupCurrentConfig;
//# sourceMappingURL=backup.js.map