"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resume = void 0;
const settings_1 = require("../../settings");
const api_1 = require("../qbittorrent/api");
const logger_1 = require("./logger");
const resume = async (torrents) => {
    const reannounceYoungest = Date.now() - (settings_1.SETTINGS.REANNOUNCE_INTERVAL * settings_1.SETTINGS.REANNOUNCE_LIMIT);
    for (let x = 0; x < torrents.length; x++) {
        const torrent = torrents[x];
        if (torrent.state === 'downloading') {
            logger_1.logger.info(`We are still downloading, not resuming rest.`);
            return; //We do not want to resume, since something else is downloading.
        }
        if (torrent.state === 'stalledDL' && (torrent.added_on * 1000) > reannounceYoungest) {
            logger_1.logger.info(`There is a torrent in reannounce phase, not resuming rest.`);
            return; //This torrent is also still in the reannounce phase
        }
    }
    const paused = torrents.filter(torrent => torrent.state === 'pausedUP');
    if (paused.length === 0) {
        logger_1.logger.info(`No downloading, nothing to resume either.`);
        return;
    }
    logger_1.logger.info(`No downloading torrents. Resuming ${paused.length} torrents...`);
    try {
        await (0, api_1.resumeTorrents)(paused);
    }
    catch (error) {
        logger_1.logger.error(`Failed to resume torrents.`);
        process.exit(1);
    }
    logger_1.logger.info(`Resumed all torrents. Exiting...`);
};
exports.resume = resume;
//# sourceMappingURL=resume.js.map