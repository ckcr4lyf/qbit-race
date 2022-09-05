/**
 * To add a new torrent into qbittorrent for racing
 */

import { getTorrentMetainfo, torrentMetainfo, TorrentMetainfoV2 } from "../helpers/torrent.js";
import { getLoggerV3 } from "../utils/logger.js"
import * as fs from 'fs';
import { Settings } from "../utils/config";
import { QbittorrentApi, QbittorrentTorrent } from "../qbittorrent/api";
import { concurrentRacesCheck, getTorrentsToPause } from "./preRace.js";
import { sleep } from "../helpers/utilities.js";
import { TrackerStatus } from "../interfaces.js";
import { buildTorrentAddedBody } from "../discord/messages.js";
import { sendMessageV2 } from "../discord/api.js";

export const addTorrentToRace = async (api: QbittorrentApi, settings: Settings, path: string, category?: string) => {

    const logger = getLoggerV3();
    logger.debug(`Called with path: ${path}, category: ${category}`);

    // Read the torrent file and get info
    let torrentFile: Buffer;
    

    try {
        torrentFile = fs.readFileSync(path);
    } catch (e){
        logger.error(`Failed to read torrent from ${e}`);
        process.exit(1);
    }

    let torrentMetainfo: TorrentMetainfoV2;

    try {
        torrentMetainfo = getTorrentMetainfo(torrentFile);
    } catch (e){
        logger.error(`Fail to parse torrent file`);
        process.exit(1);
    }

    // Do pre race check to determine if we should add this torrent 
    let torrents: QbittorrentTorrent[];
    try {
        torrents = await api.getTorrents();
    } catch (e){
        logger.error(`Failed to get torrents from qbittorrent: ${e}`);
        process.exit(1);
    }

    const goodToRace = concurrentRacesCheck(settings, torrents);

    if (goodToRace === false){
        logger.info(`Pre race conditions not met. Skipping ${torrentMetainfo.name}`);
        process.exit(0);
    }

    const torrentsToPause = getTorrentsToPause(settings, torrents);

    try {
        logger.debug(`Going to pause ${torrentsToPause.length} torrents for the race...`);
        await api.pauseTorrents(torrentsToPause);
    } catch (e){
        logger.error(`Failed to pause torrents: ${e}`)
        process.exit(1);
    }

    try {
        await api.addTorrent(torrentFile, category);        
    } catch (e){
        logger.error(`Failed to add torrent to qbittorrent: ${e}`);
        process.exit(1);
    }

    // Wait for torrent to register in qbit, initial announce
    // TODO: Figure out how we can skip real sleep in CI / test
    await sleep(5000);

    // Get the torrent's trackers, which we set as tags as well.
    const trackersAsTags: string[] = [];

    try {
        const trackers = await api.getTrackers(torrentMetainfo.hash);
        trackers.splice(0, 3); // Get rid of DHT, PEX etc.
        trackersAsTags.push(...trackers.map(tracker => new URL(tracker.url).hostname));
    } catch (e){
        logger.error(`Failed to get tags for torrent: ${e}`);
        process.exit(1);
    }

    try {
        await api.addTags([torrentMetainfo], trackersAsTags);
    } catch (e){
        logger.error(`Failed to add tags to torrent: ${e}`);
        process.exit(1);
    }

    // TODO: Torrent size somehow?
    let torrent: QbittorrentTorrent;

    try {
        torrent = await api.getTorrent(torrentMetainfo.hash);
    } catch (e){
        logger.error(`Failed to get information of torrent from qbit: ${e}`);
        process.exit(1);
    }

    logger.debug(`Startng reannounce check`);

    let attempts = 0;
    let announceOk = false;

    while (attempts < settings.REANNOUNCE_LIMIT){
        logger.debug(`Reannounce attempt #${attempts + 1}`);

        try {
            const trackers = await api.getTrackers(torrentMetainfo.hash);
            trackers.splice(0, 3); // Get rid of DHT, PEX etc.
            const working = trackers.some(tracker => tracker.status === TrackerStatus.WORKING);

            // Need to reannounce
            if (working === false){
                logger.debug(`No working tracker. Will reannounce and sleep...`)
                // TODO: API Reannounce
                await sleep(settings.REANNOUNCE_INTERVAL);
                attempts++;
            } else {
                announceOk = true;
                logger.debug(`Tracker is OK!`)
                break;
            }
        } catch (e){
            logger.error(`Failed to reannounce: ${e}`);
            process.exit(1);
        }
    }

    if (announceOk === false){
        logger.warn(`Did not get an OK from tracker even after ${settings.REANNOUNCE_LIMIT} re-announces. Deleting torrent...`);
        try {
            await api.deleteTorrentsWithFiles([torrentMetainfo]);
        } catch (e){
            logger.error(`Failed to delete torrent: ${e}`);
            process.exit(1);
        }

        // Resume any torrents that were paused for the race
        logger.debug(`Going to resume paused torrents since no race`);

        try {
            await api.resumeTorrents(torrentsToPause);
        } catch (e){
            logger.error(`Failed to resume torrents: ${e}`);
            process.exit(1);
        }

        // Clean exit
        process.exit(0);
    }

    // Announce was good!
    logger.info(`Successfully added ${torrentMetainfo.name}!`);

    if (settings.DISCORD_NOTIFICATIONS.enabled === true){
        // TODO: Send to discord
        const torrentAddedMessage = buildTorrentAddedBody(settings.DISCORD_NOTIFICATIONS, {
            name: torrent.name,
            size: torrent.size,
            trackers: trackersAsTags,
            reannounceCount: attempts
        });

        try {
            await sendMessageV2(settings.DISCORD_NOTIFICATIONS.webhook, torrentAddedMessage);
        } catch (e){
            logger.error(`Failed to send message to discord: ${e}`);
            // Do not throw for this failure.
        }
    }

    // Clean exit
    // TODO: This guy can return to upper caller instead?
    process.exit(0);
}