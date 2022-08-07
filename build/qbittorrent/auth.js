import axios from 'axios';
import { QBIT_USERNAME, QBIT_HOST, QBIT_PASSWORD, QBIT_PORT, HTTP_SCHEME, URL_PATH, setCookie } from '../config.js';
import { getLoggerV3 } from '../utils/logger.js';
import { login as apiLogin, QbittorrentApi } from './api.js';
const basePath = `${HTTP_SCHEME}://${QBIT_HOST}:${QBIT_PORT}${URL_PATH}`;
export const login = async () => {
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
            }
            else {
                reject(response.status);
            }
        }).catch(error => {
            if (error.response) {
                reject(error.response.status);
            }
            else {
                reject(999);
            }
        });
    });
};
export const loginV2 = async (qbittorrentSettings) => {
    const logger = getLoggerV3();
    try {
        const response = await apiLogin(qbittorrentSettings);
        if (typeof response.headers['set-cookie'][0] === 'string') {
            return new QbittorrentApi(qbittorrentSettings.url, response.headers['set-cookie'][0]);
        }
        logger.error(`Did not get suth cookie in response!`);
    }
    catch (e) {
        logger.error(`Failed to authenticate with qbittorrent`);
    }
    throw new Error("Failed to authenticate");
};
//# sourceMappingURL=auth.js.map