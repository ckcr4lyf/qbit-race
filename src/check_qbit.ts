import { QBIT_HOST, QBIT_PORT } from './config';
import { login } from './qbittorrent/auth';
import { feedLogger } from './helpers/logger';
import { sendMessage } from './discord/api';
import { SETTINGS } from '../settings';
import { addMessage } from './discord/messages';

module.exports = async () => {

    let t1 = Date.now();

    try {
        await login();
    } catch (errorCode) {

        if (errorCode === 999){
            feedLogger.log(`TEST`, `FAILED! qBittorrent API is not listening at http://${QBIT_HOST}:${QBIT_PORT}`);
        } else {
            feedLogger.log(`[AUTH]`, `Failed with error code ${errorCode}. Check username / password. Exiting...`);
        }

        process.exit(1);
    }

    let t2 = Date.now();
    feedLogger.log('AUTH', `Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);

    const { enabled, botUsername, botAvatar } = SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false }
    if (enabled === true){
        try {
            // await sendMessage({
            //     content: 'qbit-race validation test',
            //     username: botUsername,
            //     avatar_url: botAvatar
            // });
            await sendMessage(addMessage('Ubuntu 20.04 LTS', ['ubuntu.com', 'linux.com'], 1024 * 1024 * 1024 * 3.412, 1));
        } catch (error){
            feedLogger.log('DISCORD', 'Failed to validate discord webhook. Either disable discord notifications or fix the webhook.');
            process.exit(1);
        }
    }


    feedLogger.log(`TEST`, `SUCCESS!`);
}