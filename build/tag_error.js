"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagErroredTorrents = void 0;
const auth_1 = require("./qbittorrent/auth");
const api_1 = require("./qbittorrent/api");
const logger_1 = require("./helpers/logger");
/**
 * tagErroredTorrents gets a list of torrents from qBit, and then traverses their tracker.
 * If for any of them, apart from DHT, PEX etc. not a single tracker is status 2 (working)
 * It will tag them as an errored torrent
 * Requested by Xan
 */
const tagErroredTorrents = async (args) => {
    const dryRun = args.some(arg => arg === '--dry-run');
    if (dryRun === true) {
        logger_1.logger.info(`--dry-run specified. Will not tag any torrents!`);
    }
    let torrents;
    let t1 = Date.now();
    try {
        await (0, auth_1.login)();
    }
    catch (error) {
        logger_1.logger.error('Failed to login to qBittorrent');
        process.exit(1);
    }
    //We logged in. Get the torrents
    try {
        torrents = await (0, api_1.getTorrents)();
    }
    catch (error) {
        logger_1.logger.error('Failed to get torrents from qBittorrent');
        process.exit(1);
    }
    let toTag = [];
    for (const torrent of torrents) {
        let trackers = await (0, api_1.getTrackers)(torrent.hash);
        trackers.splice(0, 3);
        let working = trackers.some(tracker => tracker.status === 2);
        if (!working) {
            logger_1.logger.info(`[${torrent.hash}] tracker error for ${torrent.name}`);
            toTag.push(torrent);
        }
    }
    //Now let's tag them
    if (toTag.length === 0) {
        logger_1.logger.info('No errored torrents to tag...');
        process.exit(0);
    }
    if (dryRun === true) {
        logger_1.logger.info('Finished Dry Run. Exiting...');
        return;
    }
    logger_1.logger.info(`Tagging ${toTag.length} torrents...`);
    try {
        await (0, api_1.addTags)(toTag, ['error']);
    }
    catch (error) {
        logger_1.logger.error('Failed to set tags');
        process.exit(1);
    }
    const t2 = Date.now();
    logger_1.logger.info(`Successfully tagged ${toTag.length} torrents in ${((t2 - t1) / 1000).toFixed(2)} seconds!`);
};
exports.tagErroredTorrents = tagErroredTorrents;
//# sourceMappingURL=tag_error.js.map