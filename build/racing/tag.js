import { getLoggerV3 } from "../utils/logger.js";
export const tagErroredTorrents = async (api, dryRun) => {
    const logger = getLoggerV3();
    logger.info(`Starting...`);
    if (dryRun === true) {
        logger.info(`--dry-run specified, will not tag any torrents`);
    }
    let torrents;
    try {
        torrents = await api.getTorrents();
    }
    catch (e) {
        logger.error(`Failed to get torrents from api`);
        throw new Error("api failure");
    }
    let torrentsToTag = [];
    for (const torrent of torrents) {
        const trackers = await api.getTrackers(torrent.hash);
        trackers.splice(0, 3); // Get rid of DHT PEX etc.
        // See if at least one has status=2 , i.e. working
        const working = trackers.some(tracker => tracker.status === 2);
        if (working === false) {
            logger.warn(`[${torrent.hash}] tracker error for ${torrent.name}`);
            torrentsToTag.push(torrent);
        }
    }
    if (torrentsToTag.length === 0) {
        logger.info(`No torrents to tag`);
        return;
    }
    if (dryRun === true) {
        logger.info(`Reached end of dry run. Exiting...`);
        return;
    }
    logger.info(`Going to tag ${torrentsToTag.length} torrents...`);
    try {
        await api.addTags(torrentsToTag, ['error']);
    }
    catch (e) {
        logger.error(`Failed to tag torrents`);
    }
    logger.info(`Sucessfully tagged ${torrentsToTag.length} torrents!`);
};
//# sourceMappingURL=tag.js.map