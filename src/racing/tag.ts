import { QbittorrentApi } from "../qbittorrent/api.js";
import { getLoggerV3 } from "../utils/logger.js";

export const tagErroredTorrents = async (api: QbittorrentApi, dryRun: boolean) => {

    const logger = getLoggerV3();
    logger.info(`Starting...`);

    if (dryRun === true){
        logger.info(`--dry-run specified, will not tag any torrents`);
    }



}