"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRaceResume = void 0;
const settings_1 = require("../../settings");
const api_1 = require("../discord/api");
const messages_1 = require("../discord/messages");
const api_2 = require("../qbittorrent/api");
const auth_1 = require("../qbittorrent/auth");
const constants_1 = require("./constants");
const db_1 = require("./db");
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
    try {
        await auth_1.login();
    }
    catch (error) {
        console.log(`Failed to login. Exiting...`);
        process.exit(1);
    }
    logger_1.logger.info(`Login completed!`);
    // Check if this torrent's category is in the rename list
    // In case they are on old settings, skip it
    if (settings_1.SETTINGS.CATEGORY_FINISH_CHANGE !== undefined) {
        const torrentInfo = await api_2.getTorrentInfo(infohash);
        const newCategoryName = settings_1.SETTINGS.CATEGORY_FINISH_CHANGE[torrentInfo.category];
        // Check if there was a rule for it or not
        if (newCategoryName !== undefined) {
            try {
                await api_2.setCategory(infohash, newCategoryName);
                logger_1.logger.info(`Changed category for ${infohash} from ${torrentInfo.category} to ${newCategoryName}`);
            }
            catch (error) {
                logger_1.logger.error(`Failed to change category for ${infohash} from ${torrentInfo.category} to ${newCategoryName}`);
            }
        }
    }
    logger_1.logger.info(`Getting torrent list`);
    try {
        torrents = await api_2.getTorrents();
    }
    catch (error) {
        logger_1.logger.error(`Failed to get torrents from qBittorrent`);
        process.exit(1);
    }
    let torrent = torrents.find(t => t.hash === infohash);
    if (torrent === undefined) {
        logger_1.logger.error(`Unable to find completed torrent (${infohash}) in array. Exiting...`);
        process.exit(1);
    }
    // Save to DB
    db_1.addEventToDb({
        infohash: infohash,
        timestamp: Date.now(),
        uploaded: 0,
        downloaded: 0,
        ratio: torrent.ratio,
        eventType: constants_1.EVENTS.COMPLETED,
    });
    const { enabled } = settings_1.SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false };
    //Get the stats for this torrent and send to discord
    if (enabled === true) {
        try {
            logger_1.logger.info('Sending notification to deluge...');
            await api_1.sendMessage(messages_1.completeMessage(torrent.name, torrent.tags.split(','), torrent.size, torrent.ratio));
        }
        catch (error) {
            logger_1.logger.error('Failed to send notification to Discord');
        }
    }
    // handle the resume part
    await resume_1.resume(torrents);
};
exports.postRaceResume = postRaceResume;
//# sourceMappingURL=post_race_resume.js.map