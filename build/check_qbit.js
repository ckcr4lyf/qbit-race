"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const auth_1 = require("./qbittorrent/auth");
const logger_1 = require("./helpers/logger");
const api_1 = require("./discord/api");
const settings_1 = require("../settings");
const messages_1 = require("./discord/messages");
module.exports = async () => {
    let t1 = Date.now();
    // Check settings
    if (!Array.isArray(settings_1.SETTINGS.PAUSE_SKIP_CATEGORIES)) {
        logger_1.logger.error(`Failed to validate settings! PAUSE_SKIP_CATEGORIES is missing. Please check sample.settings.js and copy changes to settings.js`);
        process.exit(1);
    }
    if (!Array.isArray(settings_1.SETTINGS.PAUSE_SKIP_TAGS)) {
        logger_1.logger.error(`Failed to validate settings! PAUSE_SKIP_TAGS is missing. Please check sample.settings.js and copy changes to settings.js`);
        process.exit(1);
    }
    try {
        await (0, auth_1.login)();
    }
    catch (errorCode) {
        if (errorCode === 999) {
            logger_1.logger.error(`FAILED! qBittorrent API is not listening at http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}`);
        }
        else {
            logger_1.logger.error(`Failed with error code ${errorCode}. Check username / password. Exiting...`);
        }
        process.exit(1);
    }
    let t2 = Date.now();
    logger_1.logger.info(`Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    const { enabled, botUsername, botAvatar } = settings_1.SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false };
    if (enabled === true) {
        try {
            // await sendMessage({
            //     content: 'qbit-race validation test',
            //     username: botUsername,
            //     avatar_url: botAvatar
            // });
            await (0, api_1.sendMessage)((0, messages_1.addMessage)('Ubuntu 20.04 LTS', ['ubuntu.com', 'linux.com'], 1024 * 1024 * 1024 * 3.412, 1));
        }
        catch (error) {
            logger_1.logger.error('Failed to validate discord webhook. Either disable discord notifications or fix the webhook.');
            process.exit(1);
        }
    }
    logger_1.logger.info(`SUCCESS!`);
};
//# sourceMappingURL=check_qbit.js.map