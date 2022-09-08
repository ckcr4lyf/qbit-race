import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { defaultSettings } from './config.js';
import { getLoggerV3 } from './logger.js';
const getConfigDir = () => {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.config/qbit-race/');
    return configDir;
};
const getConfigPath = () => {
    return path.join(getConfigDir(), 'config.json');
};
export const makeConfigIfNotExist = () => {
    const logger = getLoggerV3();
    const configDir = getConfigDir();
    logger.debug(`config dir is ${configDir}`);
    try {
        const stats = fs.statSync(configDir);
        if (stats.isDirectory() === true) {
            logger.debug(`Dir exists, wont do anything`);
        }
    }
    catch (e) {
        // console.log(e.code);
        // Probably didnt exist. Try to make
        try {
            fs.mkdirSync(configDir, { recursive: true });
            logger.debug(`Made dir`);
        }
        catch (e) {
            logger.error(`Fail to make dir`);
            process.exit(1);
        }
    }
    // Now check config
    const configFilePath = path.join(configDir, 'config.json');
    // Check if config exists
    try {
        const stats = fs.statSync(configFilePath);
        if (stats.isFile() === true) {
            logger.debug(`Config file exists. Will try reading it`);
            const configFile = fs.readFileSync(configFilePath);
            const config = JSON.parse(configFile.toString());
            return config;
        }
    }
    catch (e) {
        // Probably doesnt exist
        logger.info(`Config does not exist. Writing it now...`);
        const defaultConfigToWrite = JSON.stringify(defaultSettings, null, 2);
        fs.writeFileSync(configFilePath, defaultConfigToWrite);
    }
};
/**
 * loadConfig will attempt to read and then JSON.parse the file
 * TODO: Validate its legit config
 *
 * If the directory / path to config does not exist it will throw!
 *
 * It's assumed makeConfigIfNotExist() has already been called.
 */
export const loadConfig = () => {
    const configPath = getConfigPath();
    const configData = fs.readFileSync(configPath);
    return JSON.parse(configData.toString());
};
// TODO: Future improvement: 
// If an older config, missing keys, then modify it to add the new stuff
// 
//# sourceMappingURL=configV2.js.map