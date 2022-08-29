/**
 * To add a new torrent into qbittorrent for racing
 */

import { getLoggerV3 } from "../utils/logger"

export const addTorrentToRace = (path: string, category?: string) => {

    const logger = getLoggerV3();
    logger.debug(`Called with path: ${path}, category: ${category}`);
}