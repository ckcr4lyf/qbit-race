/**
 * Functions to do some pre-race checks
 */

import { TorrentState } from "../interfaces.js";
import { QbittorrentTorrent } from "../qbittorrent/api.js";
import { Settings } from "../utils/config.js";
import { getLoggerV3 } from "../utils/logger.js";

export const concurrentRacesCheck = (settings: Settings, torrents: QbittorrentTorrent[]): boolean => {
    const logger = getLoggerV3();

    if (settings.CONCURRENT_RACES === -1){
        logger.debug(`CONCURRENT_RACES set to -1, not checking existing torrents...`);
        return true;
    }

    const downloading = torrents.filter(torrent => torrent.state === TorrentState.downloading);

    if (downloading.length >= settings.CONCURRENT_RACES){
        logger.debug(`Downloading ${downloading.length} and concurrent limit is ${settings.CONCURRENT_RACES}. Wont add`);
        return false;
    }

    // Next we see if any potential new races are in the stalled stage

    // The earliest time, from which there may still be a torrent in the reannounce phase
    // e.g. if interval is 10s, and limit is 6, then from now-60s, any torrents in stalledDL status
    // are still in the re-announce phase (for racing) , so they should be counted as "downloading"
    const oldestRaceLimit = Date.now() - (settings.REANNOUNCE_INTERVAL * settings.REANNOUNCE_LIMIT);

    const stalledDownloading = torrents.filter(torrent => {

        if (torrent.state !== TorrentState.stalledDL){
            return false;
        }

        // Count irrespective of age
        if (settings.COUNT_STALLED_DOWNLOADS === true){
            return true;            
        }

        // If its still in the reannounce phase
        if (torrent.added_on * 1000 > oldestRaceLimit){
            return true;
        }

        return false;
    });

    logger.debug(`Currently ${stalledDownloading.length} stalled downloading torrents`);

    if (downloading.length + stalledDownloading.length >= settings.CONCURRENT_RACES){
        logger.debug(`Sum of downloading and stalled downloading is ${downloading.length + stalledDownloading.length} and concurrent limit is ${settings.CONCURRENT_RACES}. Wont add`)
        return false;
    }

    return true;
}

export const torrentsToPause = (settings: Settings, torrents: QbittorrentTorrent[]): QbittorrentTorrent[] => {

    const logger = getLoggerV3();
    const torrentsToPause: QbittorrentTorrent[] = [];

    if (settings.PAUSE_RATIO === -1){
        logger.debug(`Pause ratio is -1, wont pause any torrents`);
        return torrentsToPause;
    }

    
}

