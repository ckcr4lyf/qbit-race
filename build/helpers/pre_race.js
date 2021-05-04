"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preRaceCheck = void 0;
const api_1 = require("../qbittorrent/api");
const logger_1 = require("./logger");
const constants_1 = require("./constants");
const settings_1 = require("../../settings");
const preRaceCheck = () => {
    return new Promise(async (resolve, reject) => {
        logger_1.logger.info(`Getting torrent list`);
        let torrents;
        try {
            torrents = await api_1.getTorrents();
        }
        catch (error) {
            logger_1.logger.error(`Failed to get torrents from qBittorrent`);
            process.exit(1);
        }
        if (settings_1.SETTINGS.CONCURRENT_RACES !== -1) {
            const downloading = torrents.filter(torrent => torrent.state === 'downloading');
            if (downloading.length > settings_1.SETTINGS.CONCURRENT_RACES) {
                resolve(false);
                return;
            }
            logger_1.logger.info(`Currently downloading ${downloading.length} torrents.`);
            //e.g. 5000 * 30 = 150000ms. Now - this number, is how old the oldest 
            //reannouncing torrent can be. Older than that it is a stalled torrent (seeder abandoned), and we will not count it. 
            const reannounceYoungest = Date.now() - (settings_1.SETTINGS.REANNOUNCE_INTERVAL * settings_1.SETTINGS.REANNOUNCE_LIMIT);
            const stalledDL = torrents.filter(torrent => {
                if (torrent.state === 'stalledDL') {
                    if (settings_1.SETTINGS.COUNT_STALLED_DOWNLOADS === true) {
                        return true; //We dont care about ratio in this case. Stalled is stalled.
                    }
                    if ((torrent.added_on * 1000) > reannounceYoungest) {
                        console.log('This is still in reannounce phase', torrent);
                        return true; //This is younger (timestamp is more) than limit. So it is probably still contacting tracker.
                    }
                    return false;
                }
                else {
                    return false;
                }
            });
            logger_1.logger.info(`Currently there are ${stalledDL.length} stalled torrents, waiting for race to start`);
            if ((downloading.length + stalledDL.length) >= settings_1.SETTINGS.CONCURRENT_RACES) {
                resolve(false);
                return;
            }
        }
        //If we got here, downloading is not a problem. Let's pause those whuch we can
        if (settings_1.SETTINGS.PAUSE_RATIO !== -1) {
            const uploading = torrents.filter(torrents => constants_1.SEEDING_STATES.some(state => state === torrents.state));
            logger_1.logger.info(`Currently seeding ${uploading.length} torrents.`);
            const toPause = uploading.filter(torrent => {
                //If the ratio is bellow threshold, we will not pause it anyway.
                if (torrent.ratio < settings_1.SETTINGS.PAUSE_RATIO) {
                    logger_1.logger.info(`Ratio for ${torrent.name} is below threshold. Not pausing.`);
                    return false;
                }
                //Ratio is pausable. Check category next
                if (settings_1.SETTINGS.PAUSE_SKIP_CATEGORIES.includes(torrent.category)) {
                    logger_1.logger.info(`Category ${torrent.category} for ${torrent.name} is in the skip list. Will not pause!`);
                    return false;
                }
                //Finally check the tags for any overlap
                //If for some tag in skip list, torrent tags includes it, then skip
                const torrentTags = torrent.tags.split(',');
                if (settings_1.SETTINGS.PAUSE_SKIP_TAGS.some(skipTag => torrentTags.includes(skipTag))) {
                    logger_1.logger.info(`Torrent ${torrent.name} has tags (${torrent.tags}) in common with skip tags. Will not pause!`);
                    return false;
                }
                return true;
            });
            // Do not pause categories / tags that we have set to skip
            logger_1.logger.info(`Going to pause ${toPause.length} torrents.`);
            try {
                await api_1.pauseTorrents(toPause);
            }
            catch (error) {
                logger_1.logger.error(`Failed to pause torrents`);
                process.exit(1);
            }
        }
        //We are now ready to race!
        resolve(true);
    });
};
exports.preRaceCheck = preRaceCheck;
//# sourceMappingURL=pre_race.js.map