import { sendMessageV2 } from "../discord/api.js";
import { buildTorrentCompletedBody } from "../discord/messages.js";
import { TorrentState } from "../interfaces.js";
import { getLoggerV3 } from "../utils/logger.js";
export const postRaceResumeV2 = async (api, settings, infohash) => {
    const logger = getLoggerV3();
    let torrentInfo;
    try {
        torrentInfo = await api.getTorrent(infohash);
    }
    catch (e) {
        logger.error(`Failed to get torrent from API ${e}`);
        throw e;
    }
    logger.info(`${torrentInfo.name} completed... running post race script`);
    // Handle category change stuff if applicable
    if (torrentInfo.category in settings.CATEGORY_FINISH_CHANGE) {
        const newCategory = settings.CATEGORY_FINISH_CHANGE[torrentInfo.category];
        logger.debug(`Found entry in category change map. Changing from ${torrentInfo.category} to ${newCategory}`);
        try {
            await api.setCategory(torrentInfo.hash, newCategory);
            logger.debug(`Successfully set category to ${newCategory}`);
        }
        catch (e) {
            logger.error(`Failed to set category. ${e}`);
        }
    }
    let torrents;
    try {
        torrents = await api.getTorrents();
    }
    catch (e) {
        logger.error(`Failed to get torrents list from API! ${e}`);
        process.exit(1);
    }
    // Handle discord part if enabled
    if (settings.DISCORD_NOTIFICATIONS.enabled === true) {
        const messageBody = buildTorrentCompletedBody(settings.DISCORD_NOTIFICATIONS, torrentInfo);
        try {
            await sendMessageV2(settings.DISCORD_NOTIFICATIONS.webhook, messageBody);
            logger.debug(`Sent message to discord`);
        }
        catch (e) {
            logger.error(`Failed to send message to discord ${e}`);
        }
    }
    else {
        logger.debug(`Discord notifications disabled.`);
    }
    // The earliest time, from which there may still be a torrent in the reannounce phase
    // e.g. if interval is 10s, and limit is 6, then from now-60s, any torrents in stalledDL status
    // are still in the re-announce phase (for racing) , so we do not run the resume job
    const oldestRaceLimit = Date.now() - (settings.REANNOUNCE_INTERVAL * settings.REANNOUNCE_LIMIT);
    for (let x = 0; x < torrents.length; x++) {
        if (torrents[x].state === TorrentState.downloading) {
            logger.debug(`${torrents[x].name} is still downloading, won't resume`);
            return;
        }
        if (torrents[x].state === TorrentState.stalledDL && torrents[x].added_on * 1000 > oldestRaceLimit) {
            logger.debug(`${torrents[x].name} is in re-announce phase, won't resume`);
            return;
        }
    }
    // Check if anything is paused
    const pausedTorrents = torrents.filter(torrent => torrent.state === TorrentState.pausedUP);
    if (pausedTorrents.length === 0) {
        logger.debug(`Nothing to resume (no paused torrents)`);
        return;
    }
    // Try and resume
    try {
        await api.resumeTorrents(pausedTorrents);
        logger.debug(`Successfully resumed torrents`);
    }
    catch (e) {
        logger.error(`Failed to resume torrents! ${e}`);
        process.exit(1);
    }
};
//# sourceMappingURL=completed.js.map