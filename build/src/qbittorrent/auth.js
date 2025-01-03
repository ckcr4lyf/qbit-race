import { getLoggerV3 } from '../utils/logger.js';
import { login as apiLogin, QbittorrentApi } from './api.js';
export const loginV2 = async (qbittorrentSettings) => {
    const logger = getLoggerV3();
    const response = await apiLogin(qbittorrentSettings);
    if (response.status != 200) {
        logger.error(`Unknown error logging in!\nStatus: ${response.status}\nHeaders: ${response.headers}\nBody: ${response.data}`);
        throw new Error("Failed to authenticate (UNKNOWN ERROR)");
    }
    if (response.data === 'Fails.') {
        logger.warn(`Incorrect credentials!`);
        throw new Error("Incorrect credentials");
    }
    if (response.headers['set-cookie'] === undefined || Array.isArray(response.headers['set-cookie']) === false || response.headers['set-cookie'].length === 0) {
        logger.error(`Missing set cookie header from response!\nStatus: ${response.status}\nHeaders: ${response.headers}\nBody: ${response.data}`);
        throw new Error(`Failed to authenticate (UNKNOWN ERROR)`);
    }
    const api = new QbittorrentApi(qbittorrentSettings.url, response.headers['set-cookie'][0]);
    // Need to get the version so we can choose which endpoints to use
    // See: https://github.com/ckcr4lyf/qbit-race/issues/52
    const version = await api.getAndSetVersion();
    logger.info(`Detected qBitorrent version as: ${version}`);
    return api;
};
//# sourceMappingURL=auth.js.map