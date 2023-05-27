import axios from 'axios';
import { QBITTORRENT_SETTINGS, Settings } from '../utils/config.js';
import { getLoggerV3 } from '../utils/logger.js';
import { login as apiLogin, QbittorrentApi } from './api.js';


export const loginV2 = async (qbittorrentSettings: QBITTORRENT_SETTINGS): Promise<QbittorrentApi> => {
    const logger = getLoggerV3();
    const response = await apiLogin(qbittorrentSettings);

    if (response.status != 200){
        logger.error(`Unknown error logging in!\nStatus: ${response.status}\nHeaders: ${response.headers}\nBody: ${response.data}`)
        throw new Error("Failed to authenticate (UNKNOWN ERROR)");
    }

    if (response.data === 'Fails.'){
        logger.warn(`Incorrect credentials!`);
        throw new Error("Incorrect credentials");
    }

    if (response.headers['set-cookie'] === undefined || Array.isArray(response.headers['set-cookie']) === false || response.headers['set-cookie'].length === 0) {
        logger.error(`Missing set cookie header from response!\nStatus: ${response.status}\nHeaders: ${response.headers}\nBody: ${response.data}`);
        throw new Error(`Failed to authenticate (UNKNOWN ERROR)`);
    }

    return new QbittorrentApi(qbittorrentSettings.url, response.headers['set-cookie'][0]);
}