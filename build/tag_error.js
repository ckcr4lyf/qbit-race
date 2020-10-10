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
exports.tagErroredTorrents = async (args) => {
    const dryRun = args.some(arg => arg === '--dry-run');
    if (dryRun === true) {
        logger_1.feedLogger.log('FLAGS', `--dry-run specified. Will not tag any torrents!`);
    }
    let torrents;
    let t1 = Date.now();
    try {
        await auth_1.login();
    }
    catch (error) {
        logger_1.feedLogger.log('AUTH', 'Failed to login to qBittorrent');
        process.exit(1);
    }
    //We logged in. Get the torrents
    try {
        torrents = await api_1.getTorrents();
    }
    catch (error) {
        logger_1.feedLogger.log('GET TORRENTS', 'Failed to get torrents from qBittorrent');
        process.exit(1);
    }
    //Map it to the useful shit, aka just infohashes (and name maybe).
    //This is actually pointless but map looks cool so yolo. It may even free some memory
    //When the GC runs
    torrents = torrents.map(({ name, hash }) => ({ name, hash }));
    let toTag = [];
    //Loop over them 
    for (const torrent of torrents) {
        let trackers = await api_1.getTrackers(torrent.hash);
        trackers.splice(0, 3);
        let working = trackers.some(tracker => tracker.status === 2);
        if (!working) {
            logger_1.feedLogger.log('CHECK', `[${torrent.hash}] tracker error for ${torrent.name}`);
            toTag.push(torrent);
        }
    }
    //Now let's tag them
    if (toTag.length === 0) {
        logger_1.feedLogger.log('TAG', 'No errored torrents to tag...');
        process.exit(0);
    }
    if (dryRun === true) {
        logger_1.feedLogger.log('TAG', 'Finished Dry Run. Exiting...');
        return;
    }
    logger_1.feedLogger.log('TAG', `Tagging ${toTag.length} torrents...`);
    try {
        await api_1.addTags(toTag, ['error']);
    }
    catch (error) {
        logger_1.feedLogger.log('TAG', 'Failed to set tags');
        process.exit(1);
    }
    logger_1.feedLogger.log('TAG', `Successfully tagged ${toTag.length} torrents!`);
};
//# sourceMappingURL=tag_error.js.map