import { QBIT_HOST, QBIT_PORT } from './config.js';
import { login } from './qbittorrent/auth.js';
import { getLogger } from './helpers/logger.js';
import { sendMessage } from './discord/api.js';
import { SETTINGS } from '../settings.js';
import { addMessage } from './discord/messages.js';
export const checkQbit = async () => {
    const LOG_FILE = `VALIDATE`;
    const logger = getLogger(LOG_FILE);
    let t1 = Date.now();
    // Check settings
    if (!Array.isArray(SETTINGS.PAUSE_SKIP_CATEGORIES)) {
        logger.error(`Failed to validate settings! PAUSE_SKIP_CATEGORIES is missing. Please check sample.settings.js and copy changes to settings.js`);
        process.exit(1);
    }
    if (!Array.isArray(SETTINGS.PAUSE_SKIP_TAGS)) {
        logger.error(`Failed to validate settings! PAUSE_SKIP_TAGS is missing. Please check sample.settings.js and copy changes to settings.js`);
        process.exit(1);
    }
    try {
        await login();
    }
    catch (errorCode) {
        if (errorCode === 999) {
            logger.error(`FAILED! qBittorrent API is not listening at http://${QBIT_HOST}:${QBIT_PORT}`);
        }
        else {
            logger.error(`Failed with error code ${errorCode}. Check username / password. Exiting...`);
        }
        process.exit(1);
    }
    let t2 = Date.now();
    logger.info(`Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    const { enabled, botUsername, botAvatar } = SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false };
    if (enabled === true) {
        try {
            await sendMessage(addMessage('[VALIDATE TEST] Ubuntu 20.04 LTS', ['ubuntu.com', 'linux.com'], 1024 * 1024 * 1024 * 3.412, 1));
        }
        catch (error) {
            logger.error('Failed to validate discord webhook. Either disable discord notifications or fix the webhook.');
            process.exit(1);
        }
    }
    logger.info(`SUCCESS!`);
};
//# sourceMappingURL=check_qbit.js.map