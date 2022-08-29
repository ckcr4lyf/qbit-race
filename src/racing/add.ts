/**
 * To add a new torrent into qbittorrent for racing
 */

import { getTorrentMetainfo, torrentMetainfo } from "../helpers/torrent.js";
import { getLoggerV3 } from "../utils/logger.js"
import * as fs from 'fs';
import { Settings } from "../utils/config";
import { QbittorrentApi } from "../qbittorrent/api";

export const addTorrentToRace = (api: QbittorrentApi, settings: Settings, path: string, category?: string) => {

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

    let torrentMetainfo: torrentMetainfo;

    try {
        torrentMetainfo = getTorrentMetainfo(torrentFile);
    } catch (e){
        logger.error(`Fail to parse torrent file`);
        process.exit(1);
    }

    // Do pre race check to determine if we should add this torrent    

}