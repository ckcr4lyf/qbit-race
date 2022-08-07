import axios from 'axios';
import { QBIT_USERNAME, QBIT_HOST, QBIT_PASSWORD, QBIT_PORT, HTTP_SCHEME, URL_PATH, setCookie } from '../config.js';
import { QBITTORRENT_SETTINGS, Settings } from '../utils/config.js';
import { getLoggerV3 } from '../utils/logger.js';
import { login as apiLogin, QbittorrentApi } from './api.js';

const basePath = `${HTTP_SCHEME}://${QBIT_HOST}:${QBIT_PORT}${URL_PATH}`

export const login = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        axios.get(`${basePath}/api/v2/auth/login`, {
            params: {
                username: QBIT_USERNAME,
                password: QBIT_PASSWORD
            }
        }).then(response => {
            if (response.headers['set-cookie']) {
                setCookie(response.headers['set-cookie'][0]);
                resolve();
            } else {
                reject(response.status);
            }
        }).catch(error => {
            if (error.response) {
                reject(error.response.status);
            } else {
                reject(999);
            }
        });
    });
}

export const loginV2 = async (qbittorrentSettings: QBITTORRENT_SETTINGS): Promise<QbittorrentApi> => {
    const logger = getLoggerV3();

    const response = await apiLogin(qbittorrentSettings);

    // TODO: Differentiate between wrong credentials vs. qbit is not listening (wrong URL / port etc.)
    if (Array.isArray(response.headers['set-cookie']) === false || response.headers['set-cookie'].length === 0) {
        throw new Error(`Failed to authenticate`);
    }

    return new QbittorrentApi(qbittorrentSettings.url, response.headers['set-cookie'][0]);
}