import { SETTINGS } from '../../settings.js';
import { sendMessage } from '../discord/api.js';
import { completeMessage } from '../discord/messages.js';
import { getTorrentInfo, getTorrents, setCategory } from "../qbittorrent/api.js";
import { login } from "../qbittorrent/auth.js";
import { logger } from "./logger.js";
import { resume } from './resume.js';
/**
 * postRaceResume runs after a race completes and resumes torrents.
 *
 * It first calls getTorrents to get a list, and then checks to see if any are still downloading.
 * It also checks if any are stalled / in reannounce loop.
 * If nothing is pending, it will resume all torrents.
 */
export const postRaceResume = async (infohash, tracker) => {
    let torrents;
    try {
        await login();
    }
    catch (error) {
        console.log(`Failed to login. Exiting...`);
        process.exit(1);
    }
    logger.info(`Login completed!`);
    // Check if this torrent's category is in the rename list
    // In case they are on old settings, skip it
    if (SETTINGS.CATEGORY_FINISH_CHANGE !== undefined) {
        const torrentInfo = await getTorrentInfo(infohash);
        const newCategoryName = SETTINGS.CATEGORY_FINISH_CHANGE[torrentInfo.category];
        // Check if there was a rule for it or not
        if (newCategoryName !== undefined) {
            try {
                await setCategory(infohash, newCategoryName);
                logger.info(`Changed category for ${infohash} from ${torrentInfo.category} to ${newCategoryName}`);
            }
            catch (error) {
                logger.error(`Failed to change category for ${infohash} from ${torrentInfo.category} to ${newCategoryName}`);
            }
        }
    }
    logger.info(`Getting torrent list`);
    try {
        torrents = await getTorrents();
    }
    catch (error) {
        logger.error(`Failed to get torrents from qBittorrent`);
        process.exit(1);
    }
    //Get the stats for this torrent and send to discord
    const { enabled } = SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false };
    if (enabled === true) {
        let torrent = torrents.find(t => t.hash === infohash);
        if (torrent === undefined) {
            logger.error(`Unable to find completed torrent (${infohash}) in array. Exiting...`);
            process.exit(1);
        }
        try {
            logger.info('Sending notification to deluge...');
            await sendMessage(completeMessage(torrent.name, torrent.tags.split(','), torrent.size, torrent.ratio));
        }
        catch (error) {
            logger.error('Failed to send notification to Discord');
        }
    }
    // handle the resume part
    await resume(torrents);
};
//# sourceMappingURL=post_race_resume.js.map