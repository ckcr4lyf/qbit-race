/**
 * Functions to do some pre-race checks
 */
import { SEEDING_STATES, TorrentState } from "../interfaces.js";
import { getLoggerV3 } from "../utils/logger.js";
export const concurrentRacesCheck = (settings, torrents) => {
    const logger = getLoggerV3();
    if (settings.CONCURRENT_RACES === -1) {
        logger.debug(`CONCURRENT_RACES set to -1, not checking existing torrents...`);
        return true;
    }
    const downloading = torrents.filter(torrent => torrent.state === TorrentState.downloading);
    if (downloading.length >= settings.CONCURRENT_RACES) {
        logger.debug(`Downloading ${downloading.length} and concurrent limit is ${settings.CONCURRENT_RACES}. Wont add`);
        return false;
    }
    // Next we see if any potential new races are in the stalled stage
    // The earliest time, from which there may still be a torrent in the reannounce phase
    // e.g. if interval is 10s, and limit is 6, then from now-60s, any torrents in stalledDL status
    // are still in the re-announce phase (for racing) , so they should be counted as "downloading"
    const oldestRaceLimit = Date.now() - (settings.REANNOUNCE_INTERVAL * settings.REANNOUNCE_LIMIT);
    const stalledDownloading = torrents.filter(torrent => {
        if (torrent.state !== TorrentState.stalledDL) {
            return false;
        }
        // Count irrespective of age
        if (settings.COUNT_STALLED_DOWNLOADS === true) {
            return true;
        }
        // If its still in the reannounce phase
        if (torrent.added_on * 1000 > oldestRaceLimit) {
            return true;
        }
        return false;
    });
    logger.debug(`Currently ${stalledDownloading.length} stalled downloading torrents`);
    if (downloading.length + stalledDownloading.length >= settings.CONCURRENT_RACES) {
        logger.debug(`Sum of downloading and stalled downloading is ${downloading.length + stalledDownloading.length} and concurrent limit is ${settings.CONCURRENT_RACES}. Wont add`);
        return false;
    }
    return true;
};
export const torrentsToPause = (settings, torrents) => {
    const logger = getLoggerV3();
    if (settings.PAUSE_RATIO === -1) {
        logger.debug(`Pause ratio is -1, wont pause any torrents`);
        return [];
    }
    const torrentsToPause = torrents.filter(torrent => {
        // Not seeding - no need to pause
        if (SEEDING_STATES.some(state => state === torrent.state) === false) {
            return false;
        }
        // If ratio below pause ratio then dont
        if (torrent.ratio < settings.PAUSE_RATIO) {
            logger.debug(`Ratio for ${torrent.name} is  ${torrent.ratio} - below pause ratio. Wont pause`);
            return false;
        }
        // If the cateogry is set to skip then dont
        if (settings.PAUSE_SKIP_CATEGORIES.includes(torrent.category)) {
            logger.debug(`Category for ${torrent.name} is ${torrent.category} - included in PAUSE_SKIP_CATEGORIES. Wont pause`);
            return false;
        }
        // Lastly - if any tags are to not skip then dont
        const torrentTags = torrent.tags.split(',');
        const skipTag = settings.PAUSE_SKIP_TAGS.find(tag => torrentTags.includes(tag));
        if (skipTag !== undefined) {
            logger.debug(`Tags for ${torrent.name} contains ${skipTag} - included in PAUSE_SKIP_TAGS. Wont pause`);
            return false;
        }
        // Otherwise we should pause this guy for the upcoming race
        return true;
    });
    return torrentsToPause;
};
//# sourceMappingURL=preRace.js.map