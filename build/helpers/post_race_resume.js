"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRaceResume = void 0;
const settings_1 = require("../../settings");
const api_1 = require("../discord/api");
const messages_1 = require("../discord/messages");
const api_2 = require("../qbittorrent/api");
const auth_1 = require("../qbittorrent/auth");
const logger_1 = require("./logger");
/**
 * postRaceResume runs after a race completes and resumes torrents.
 *
 * It first calls getTorrents to get a list, and then checks to see if any are still downloading.
 * It also checks if any are stalled / in reannounce loop.
 * If nothing is pending, it will resume all torrents.
 */
exports.postRaceResume = async (infohash, tracker) => {
    // feedLogger.log('POST RACE', `Called with infohash=${infohash}&tracker=${tracker}`);
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
    logger_1.feedLogger.log('POST RACE', `Getting torrent list`);
    try {
        torrents = await api_2.getTorrents();
    }
    catch (error) {
        logger_1.feedLogger.log('POST RACE', `Failed to get torrents from qBittorrent`);
        process.exit(1);
    }
    torrents = torrents.map(({ name, hash, state, added_on, ratio, size, tags }) => ({ name, hash, state, added_on, ratio, size, tags }));
    const reannounceYoungest = Date.now() - (settings_1.SETTINGS.REANNOUNCE_INTERVAL * settings_1.SETTINGS.REANNOUNCE_LIMIT);
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
    for (let x = 0; x < torrents.length; x++) {
        const torrent = torrents[x];
        if (torrent.state === 'downloading') {
            logger_1.feedLogger.log('POST RACE', `We are still downloading, not resuming rest.`);
            return; //We do not want to resume, since something else is downloading.
        }
        if (torrent.state === 'stalledDL' && (torrent.added_on * 1000) > reannounceYoungest) {
            logger_1.feedLogger.log('POST RACE', `There is a torrent in reannounce phase, not resuming rest.`);
            return; //This torrent is also still in the reannounce phase
        }
    }
    const paused = torrents.filter(torrent => torrent.state === 'pausedUP');
    if (paused.length === 0) {
        logger_1.feedLogger.log('POST RACE', `No downloading, nothing to resume either.`);
        return;
    }
    logger_1.feedLogger.log('POST RACE', `No downloading torrents. Resuming ${paused.length} torrents...`);
    try {
        await api_2.resumeTorrents(paused);
    }
    catch (error) {
        logger_1.feedLogger.log('POST RACE', `Failed to resume torrents.`);
        process.exit(1);
    }
    logger_1.feedLogger.log('POST RACE', `Resumed all torrents. Exiting...`);
};
//# sourceMappingURL=post_race_resume.js.map