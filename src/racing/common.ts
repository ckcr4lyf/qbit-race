/**
 * Racing a torrent consists of a few steps:
 * 
 * # Case 1: qbit-race used to add a new torrent
 * 
 * [Pre addition]
 * 
 * 1. Get list of existing torrents
 * 2. Check concurrent racing rules to see if it is ok to add
 *    a. Skip race if existing torrents
 * 3. Pause torrents before adding
 * 4. Add torrent
 * 
 * [Post addition]
 * 5. Try and reannounce if applicable
 * 
 * [Successfully announce]
 * 6a. Discord message
 * 
 * [Fail to reannounce]
 * 6b. Delete torrent, resume existing torrents
 * 
 * # Case 2: qbit-race used to apply "race mode" to existing torrent
 * 
 * 1. Try and pause torrents
 * 2. Try and reannounce if applicable
 * 
 * [Successfully announce]
 * 3a. Discord message
 * 
 * [Fail to reannounce]
 * 3b. noop
 */

import { sleep } from "../helpers/utilities.js";
import { TrackerStatus } from "../interfaces.js";
import { QbittorrentApi, QbittorrentTorrent } from "../qbittorrent/api.js";
import { Settings } from "../utils/config.js";
import { getLoggerV3 } from "../utils/logger.js"
import { getTorrentsToPause } from "./preRace.js";


/**
 * raceExisting will try and "race" and existing torrent, by:
 * 
 * * Pausing existing torrents
 * * Try and reannounce if applicable
 * @param api The qbittorrent API
 * @param settings Settings for checking pause ratio etc.
 * @param infohash Infohash of newly added torrent
 */
export const raceExisting = async (api: QbittorrentApi, settings: Settings, infohash: string) => {
    const logger = getLoggerV3();
    logger.debug(`raceExisting called with infohash: ${infohash}`);

    const torrent = await api.getTorrent(infohash);

    // Try and pause existing torrents
    const torrents = await (async () => {
        try {
            const xd = await api.getTorrents();
            return xd;
        } catch (e){
            logger.error(`Failed to get torrents from qBittorrent API: ${e}`);
            process.exit(-1);
        }
    })();

    const torrentsToPause = getTorrentsToPause(settings, torrents);
    logger.debug(`Going to pause ${torrentsToPause.length} torrents`);

    try {
        await api.pauseTorrents(torrentsToPause);
    } catch (e){
        logger.error(`Failed to pause torrents: ${e}`);
        process.exit(-1);
    }

    // TODO: Add trackers as tags?
    const announceOk = await reannounce(api, settings, torrent);

    if (announceOk === false){
        logger.debug(`Going to resume torrents since failed to race`);
        await api.resumeTorrents(torrentsToPause);
        process.exit(0);
    }

    logger.info(`Successfully racing ${torrent.name}`);

    // TODO: Discord message

    process.exit(0);
}

export const reannounce = async (api: QbittorrentApi, settings: Settings, torrent: QbittorrentTorrent): Promise<boolean> => {
    const logger = getLoggerV3();
    logger.debug(`Starting reannounce check`);

    let attempts = 0;

    while (attempts < settings.REANNOUNCE_LIMIT){
        logger.debug(`Reannounce attempt #${attempts+1}`);

        const trackers = await api.getTrackers(torrent.hash);
        trackers.splice(0, 3); // Get rid of DHT, PEX etc.
        const working = trackers.some(tracker => tracker.status === TrackerStatus.WORKING);

        // Need to reannounce
        if (working === false){
            logger.debug(`No working tracker. Will reannounce and sleep...`)
            await api.reannounce(torrent.hash);
            await sleep(settings.REANNOUNCE_INTERVAL);
            attempts++;
        } else {
            logger.debug(`Tracker is OK!`)
            return true;
        }
    }

    logger.debug(`Did not get OK from tracker even after ${settings.REANNOUNCE_LIMIT} re-announces!`);
    return false;
}