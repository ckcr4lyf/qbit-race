import { getLoggerV3 } from '../utils/logger.js';
import { login as apiLogin, QbittorrentApi } from './api.js';
export const loginV2 = async (qbittorrentSettings) => {
    const logger = getLoggerV3();
    const response = await apiLogin(qbittorrentSettings);
    // TODO: Differentiate between wrong credentials vs. qbit is not listening (wrong URL / port etc.)
    if (response.headers['set-cookie'] === undefined || Array.isArray(response.headers['set-cookie']) === false || response.headers['set-cookie'].length === 0) {
        throw new Error(`Failed to authenticate`);
    }
    return new QbittorrentApi(qbittorrentSettings.url, response.headers['set-cookie'][0]);
};
//# sourceMappingURL=auth.js.map