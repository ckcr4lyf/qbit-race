import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { defaultSettings } from './config.js';

const getConfigDir = (): string => {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.config/qbit-race/');
    return configDir;
}

export const makeConfigIfNotExist = () => {
    const configDir = getConfigDir();
    console.log(`config dir is ${configDir}`)

    let stats: fs.Stats;

    try {
        const stats = fs.statSync(configDir);

        if (stats.isDirectory() === true) {
            console.log(`Dir exists, wont do anything`);
        }
    } catch (e) {
        // console.log(e.code);
        // Probably didnt exist. Try to make
        try {
            fs.mkdirSync(configDir, { recursive: true });
            console.log(`Made dir`);
        } catch (e) {
            console.log(`Fail to make dir`);
            process.exit(1);
        }
    }

    // Now check config
    const configFilePath = path.join(configDir, 'config.json');

    // Check if config exists

    try {
        const stats = fs.statSync(configFilePath);

        if (stats.isFile() === true) {
            console.log(`Config file exists. Will try reading it`);
            const configFile = fs.readFileSync(configFilePath);

            const config = JSON.parse(configFile.toString());
            return config;
        }
    } catch (e) {
        // Probably doesnt exist
        console.log(`Config does not exsit. Writing it now...`);
        const defaultConfigToWrite = JSON.stringify(defaultSettings, null, 2);
        fs.writeFileSync(configFilePath, defaultConfigToWrite);
    }
}
