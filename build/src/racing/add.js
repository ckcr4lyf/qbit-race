/**
 * To add a new torrent into qbittorrent for racing
 */
import { getTorrentMetainfo } from "../helpers/torrent.js";
import { getLoggerV3 } from "../utils/logger.js";
import * as fs from 'fs';
import { concurrentRacesCheck, getTorrentsToPause } from "./preRace.js";
import { sleep } from "../helpers/utilities.js";
import { TrackerStatus } from "../interfaces.js";
import { buildTorrentAddedBody } from "../discord/messages.js";
import { sendMessageV2 } from "../discord/api.js";
import axios from "axios";
export const addTorrentToRace = async (api, settings, path, options, category) => {
    const logger = getLoggerV3();
    logger.debug(`Called with path: ${path}, category: ${category}`);
    // Read the torrent file and get info
    let torrentFile;
    try {
        torrentFile = fs.readFileSync(path);
    }
    catch (e) {
        logger.error(`Failed to read torrent from ${e}`);
        process.exit(1);
    }
    let torrentMetainfo;
    try {
        torrentMetainfo = getTorrentMetainfo(torrentFile);
    }
    catch (e) {
        logger.error(`Fail to parse torrent file`);
        process.exit(1);
    }
    // Do pre race check to determine if we should add this torrent 
    let torrents;
    try {
        torrents = await api.getTorrents();
    }
    catch (e) {
        logger.error(`Failed to get torrents from qbittorrent: ${e}`);
        process.exit(1);
    }
    const goodToRace = concurrentRacesCheck(settings, torrents);
    if (goodToRace === false) {
        logger.info(`Pre race conditions not met. Skipping ${torrentMetainfo.name}`);
        process.exit(0);
    }
    // TODO: Move to common race part
    const torrentsToPause = getTorrentsToPause(settings, torrents);
    try {
        logger.debug(`Going to pause ${torrentsToPause.length} torrents for the race...`);
        await api.pauseTorrents(torrentsToPause);
    }
    catch (e) {
        logger.error(`Failed to pause torrents: ${e}`);
        process.exit(1);
    }
    try {
        await api.addTorrent(torrentFile, category);
    }
    catch (e) {
        logger.error(`Failed to add torrent to qbittorrent: ${e}`);
        process.exit(1);
    }
    // Wait for torrent to register in qbit, initial announce
    logger.debug(`Going to sleep for 5 seconds to allow torrent to register...`);
    await sleep(5000);
    logger.debug(`Finished sleeping, going to get trackers`);
    // Get the torrent's trackers, which we set as tags as well.
    const trackersAsTags = [];
    let registeredFlag = false;
    for (let i = 0; i < 25; i++) {
        logger.debug(`Attempt #${i + 1} to get trackers`);
        try {
            const trackers = await api.getTrackers(torrentMetainfo.hash);
            trackers.splice(0, 3); // Get rid of DHT, PEX etc.
            trackersAsTags.push(...trackers.map(tracker => new URL(tracker.url).hostname));
            logger.info(`Successfully got trackers!`);
            registeredFlag = true;
            break;
        }
        catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 404) {
                logger.warn(`Got 404 from qbittorrent, probably not registered yet... Will sleep for a second and try again. (Error: ${e})`);
                await sleep(1000);
                continue;
            }
            logger.error(`Failed to get tags for torrent: ${e}`);
            process.exit(1);
        }
    }
    if (registeredFlag === false) {
        logger.error(`Failed to get torrent from qbit, maybe not registered!`);
        process.exit(1);
    }
    const tagsToAdd = [];
    if (options.trackerTags === false) {
        logger.debug(`--no-tracker-tags specified, will skip adding them to the torrent!`);
    }
    else {
        tagsToAdd.push(...trackersAsTags);
    }
    if (options.extraTags !== undefined) {
        const extraTags = options.extraTags.split(',');
        logger.debug(`Going to add extra tags: ${extraTags}`);
        tagsToAdd.push(...extraTags);
    }
    if (tagsToAdd.length !== 0) {
        try {
            await api.addTags([torrentMetainfo], tagsToAdd);
        }
        catch (e) {
            logger.error(`Failed to add tags to torrent: ${e}`);
            process.exit(1);
        }
    }
    let torrent;
    try {
        torrent = await api.getTorrent(torrentMetainfo.hash);
    }
    catch (e) {
        logger.error(`Failed to get information of torrent from qbit: ${e}`);
        process.exit(1);
    }
    logger.debug(`Startng reannounce check`);
    let attempts = 0;
    let announceOk = false;
    while (attempts < settings.REANNOUNCE_LIMIT) {
        logger.debug(`Reannounce attempt #${attempts + 1}`);
        try {
            const trackers = await api.getTrackers(torrentMetainfo.hash);
            trackers.splice(0, 3); // Get rid of DHT, PEX etc.
            const working = trackers.some(tracker => tracker.status === TrackerStatus.WORKING);
            // Need to reannounce
            if (working === false) {
                logger.debug(`No working tracker. Will reannounce and sleep...`);
                await api.reannounce(torrent.hash);
                await sleep(settings.REANNOUNCE_INTERVAL);
                attempts++;
            }
            else {
                announceOk = true;
                logger.debug(`Tracker is OK!`);
                break;
            }
        }
        catch (e) {
            logger.error(`Failed to reannounce: ${e}`);
            process.exit(1);
        }
    }
    if (announceOk === false) {
        logger.warn(`Did not get an OK from tracker even after ${settings.REANNOUNCE_LIMIT} re-announces. Deleting torrent...`);
        try {
            await api.deleteTorrentsWithFiles([torrentMetainfo]);
        }
        catch (e) {
            logger.error(`Failed to delete torrent: ${e}`);
            process.exit(1);
        }
        // Resume any torrents that were paused for the race
        logger.debug(`Going to resume paused torrents since no race`);
        try {
            await api.resumeTorrents(torrentsToPause);
        }
        catch (e) {
            logger.error(`Failed to resume torrents: ${e}`);
            process.exit(1);
        }
        // Clean exit
        process.exit(0);
    }
    // Announce was good!
    logger.info(`Successfully added ${torrentMetainfo.name}!`);
    if (settings.DISCORD_NOTIFICATIONS.enabled === true) {
        const torrentAddedMessage = buildTorrentAddedBody(settings.DISCORD_NOTIFICATIONS, {
            name: torrent.name,
            size: torrent.size,
            trackers: trackersAsTags,
            reannounceCount: attempts
        });
        try {
            await sendMessageV2(settings.DISCORD_NOTIFICATIONS.webhook, torrentAddedMessage);
        }
        catch (e) {
            logger.error(`Failed to send message to discord: ${e}`);
            // Do not throw for this failure.
        }
    }
    // Clean exit
    // TODO: This guy can return to upper caller instead?
    process.exit(0);
};
//# sourceMappingURL=add.js.map