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
    try {
        await auth_1.login();
    }
    catch (errorCode) {
        if (errorCode === 999) {
            logger_1.feedLogger.log(`TEST`, `FAILED! qBittorrent API is not listening at http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}`);
        }
        else {
            logger_1.feedLogger.log(`[AUTH]`, `Failed with error code ${errorCode}. Check username / password. Exiting...`);
        }
        process.exit(1);
    }
    let t2 = Date.now();
    logger_1.feedLogger.log('AUTH', `Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    const { enabled, botUsername, botAvatar } = settings_1.SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false };
    if (enabled === true) {
        try {
            // await sendMessage({
            //     content: 'qbit-race validation test',
            //     username: botUsername,
            //     avatar_url: botAvatar
            // });
            await api_1.sendMessage(messages_1.addMessage('Ubuntu 20.04 LTS', ['ubuntu.com', 'linux.com'], 1024 * 1024 * 1024 * 3.412, 1));
        }
        catch (error) {
            logger_1.feedLogger.log('DISCORD', 'Failed to validate discord webhook. Either disable discord notifications or fix the webhook.');
            process.exit(1);
        }
    }
    logger_1.feedLogger.log(`TEST`, `SUCCESS!`);
};
//# sourceMappingURL=check_qbit.js.map