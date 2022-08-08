import { login } from './qbittorrent/auth.js';
import { addTags, getTorrents, getTrackers } from './qbittorrent/api.js';
import { logger } from './helpers/logger.js';
/**
 * tagErroredTorrents gets a list of torrents from qBit, and then traverses their tracker.
 * If for any of them, apart from DHT, PEX etc. not a single tracker is status 2 (working)
 * It will tag them as an errored torrent
 * Requested by Xan
 */
export const tagErroredTorrents = async (args) => {
    const dryRun = args.some(arg => arg === '--dry-run');
    if (dryRun === true) {
        logger.info(`--dry-run specified. Will not tag any torrents!`);
    }
    let torrents;
    let t1 = Date.now();
    try {
        await login();
    }
    catch (error) {
        logger.error('Failed to login to qBittorrent');
        process.exit(1);
    }
    //We logged in. Get the torrents
    try {
        torrents = await getTorrents();
    }
    catch (error) {
        logger.error('Failed to get torrents from qBittorrent');
        process.exit(1);
    }
    // this typing is wrong
    let toTag = [];
    for (const torrent of torrents) {
        let trackers = await getTrackers(torrent.hash);
        trackers.splice(0, 3);
        let working = trackers.some(tracker => tracker.status === 2);
        if (!working) {
            logger.info(`[${torrent.hash}] tracker error for ${torrent.name}`);
            toTag.push(torrent);
        }
    }
    //Now let's tag them
    if (toTag.length === 0) {
        logger.info('No errored torrents to tag...');
        process.exit(0);
    }
    if (dryRun === true) {
        logger.info('Finished Dry Run. Exiting...');
        return;
    }
    logger.info(`Tagging ${toTag.length} torrents...`);
    try {
        await addTags(toTag, ['error']);
    }
    catch (error) {
        logger.error('Failed to set tags');
        process.exit(1);
    }
    const t2 = Date.now();
    logger.info(`Successfully tagged ${toTag.length} torrents in ${((t2 - t1) / 1000).toFixed(2)} seconds!`);
};
//# sourceMappingURL=tag_error.js.map