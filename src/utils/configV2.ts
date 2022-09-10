import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { defaultSettings, Settings } from './config.js';
import { getLoggerV3 } from './logger.js';

const getConfigDir = (): string => {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.config/qbit-race/');
    return configDir;
}

const getConfigPath = (): string => {
    return path.join(getConfigDir(), 'config.json');
}

export const getFilePathInConfigDir = (filename: string) => {
    return path.join(getConfigDir(), filename);
}

export const makeConfigDirIfNotExist = () => {
    const configDir = getConfigDir();

    try {
        const stats = fs.statSync(configDir);

        if (stats.isDirectory() === true) {
            return;
        }
    } catch (e) {
        // Probably didnt exist. Try to make
        fs.mkdirSync(configDir, { recursive: true });
    }
}

export const makeConfigIfNotExist = () => {
    makeConfigDirIfNotExist();
    const configDir = getConfigDir();
    const logger = getLoggerV3();

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
    } catch (e) {
        // Probably doesnt exist
        logger.info(`Config does not exist. Writing it now...`);
        const defaultConfigToWrite = JSON.stringify(defaultSettings, null, 2);
        fs.writeFileSync(configFilePath, defaultConfigToWrite);
    }
}

/**
 * loadConfig will attempt to read and then JSON.parse the file
 * TODO: Validate its legit config
 * 
 * If the directory / path to config does not exist it will throw!
 * 
 * It's assumed makeConfigIfNotExist() has already been called.
 */
export const loadConfig = (): Settings => {
    const configPath = getConfigPath();
    const configData = fs.readFileSync(configPath);
    return JSON.parse(configData.toString());
}

// TODO: Future improvement: 
// If an older config, missing keys, then modify it to add the new stuff
// 