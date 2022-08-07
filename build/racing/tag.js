import { getLoggerV3 } from "../utils/logger.js";
export const tagErroredTorrents = async (api, dryRun) => {
    const logger = getLoggerV3();
    logger.info(`Starting...`);
    if (dryRun === true) {
        logger.info(`--dry-run specified, will not tag any torrents`);
    }
};
//# sourceMappingURL=tag.js.map