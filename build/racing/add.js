/**
 * To add a new torrent into qbittorrent for racing
 */
import { getTorrentMetainfo } from "../helpers/torrent.js";
import { getLoggerV3 } from "../utils/logger.js";
import * as fs from 'fs';
import { concurrentRacesCheck, getTorrentsToPause } from "./preRace.js";
import { sleep } from "../helpers/utilities.js";
export const addTorrentToRace = async (api, settings, path, category) => {
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
    // TODO: Figure out how we can skip real sleep in CI / test
    await sleep(5000);
    // Get the torrent's trackers, which we set as tags as well.
    const tags = [];
    try {
        const trackers = await api.getTrackers(torrentMetainfo.hash);
        trackers.splice(0, 3); // Get rid of DHT, PEX etc.
        tags.push(...trackers.map(tracker => new URL(tracker.url).hostname));
    }
    catch (e) {
        logger.error(`Failed to get tags for torrent: ${e}`);
        process.exit(1);
    }
    try {
        await api.addTags([torrentMetainfo], tags);
    }
    catch (e) {
        logger.error(`Failed to add tags to torrent: ${e}`);
    }
};
//# sourceMappingURL=add.js.map