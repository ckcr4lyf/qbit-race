"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRaceResume = void 0;
const settings_1 = require("../../settings");
const api_1 = require("../discord/api");
const messages_1 = require("../discord/messages");
const api_2 = require("../qbittorrent/api");
const auth_1 = require("../qbittorrent/auth");
const logger_1 = require("./logger");
const resume_1 = require("./resume");
/**
 * postRaceResume runs after a race completes and resumes torrents.
 *
 * It first calls getTorrents to get a list, and then checks to see if any are still downloading.
 * It also checks if any are stalled / in reannounce loop.
 * If nothing is pending, it will resume all torrents.
 */
const postRaceResume = async (infohash, tracker) => {
    let torrents;
    let t1 = Date.now();
    try {
        await auth_1.login();
    }
    catch (error) {
        console.log(`Failed to login. Exiting...`);
        process.exit(1);
    }
    let t2 = Date.now();
    logger_1.feedLogger.log('AUTH', `Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    // Check if this torrent's category is in the rename list
    // In case they are on old settings, skip it
    if (settings_1.SETTINGS.CATEGORY_FINISH_CHANGE !== undefined) {
        const torrentInfo = await api_2.getTorrentInfo(infohash);
        const newCategoryName = settings_1.SETTINGS.CATEGORY_FINISH_CHANGE[torrentInfo.category];
        // Check if there was a rule for it or not
        if (newCategoryName !== undefined) {
            try {
                await api_2.setCategory(infohash, newCategoryName);
                logger_1.feedLogger.log('POST RACE', `Changed category for ${infohash} from ${torrentInfo.category} to ${newCategoryName}`);
            }
            catch (error) {
                logger_1.feedLogger.log('POST RACE', `Failed to change category for ${infohash} from ${torrentInfo.category} to ${newCategoryName}`);
            }
        }
    }
    logger_1.feedLogger.log('POST RACE', `Getting torrent list`);
    try {
        torrents = await api_2.getTorrents();
    }
    catch (error) {
        logger_1.feedLogger.log('POST RACE', `Failed to get torrents from qBittorrent`);
        process.exit(1);
    }
    //Get the stats for this torrent and send to discord
    const { enabled } = settings_1.SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false };
    if (enabled === true) {
        let torrent = torrents.find(t => t.hash === infohash);
        if (torrent === undefined) {
            logger_1.feedLogger.log('POST RACE', `Unable to find completed torrent (${infohash}) in array. Exiting...`);
            process.exit(1);
        }
        try {
            logger_1.feedLogger.log('POST RACE', 'Sending notification to deluge...');
            await api_1.sendMessage(messages_1.completeMessage(torrent.name, torrent.tags.split(','), torrent.size, torrent.ratio));
        }
        catch (error) {
            logger_1.feedLogger.log('POST RACE', 'Failed to send notification to Discord');
        }
    }
    // handle the resume part
    await resume_1.resume('POST RACE', torrents);
};
exports.postRaceResume = postRaceResume;
//# sourceMappingURL=post_race_resume.js.map