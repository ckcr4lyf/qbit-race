"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./qbittorrent/auth");
const api_1 = require("./qbittorrent/api");
const utilities_1 = require("./helpers/utilities");
const logger_1 = require("./helpers/logger");
module.exports = async (args) => {
    const infohash = args[0];
    const torrentName = args[1];
    const tracker = args[2];
    const path = args[3];
    let t1 = Date.now();
    try {
        await auth_1.login();
    }
    catch (error) {
        console.log(`Failed to login. Exiting...`);
        process.exit(1);
    }
    let t2 = Date.now();
    logger_1.feedLogger.log('AUTH', `Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    logger_1.feedLogger.log('ADD TORRENT', `Adding torrent ${torrentName}`);
    try {
        await api_1.addTorrent(path);
    }
    catch (error) {
        process.exit(1);
    }
    await utilities_1.sleep(5000);
    logger_1.feedLogger.log("ADD TORRENT", "Getting trackers");
    let attempts = 0;
    const WAIT_TIME = 5000; //In milliseconds
    const ATTEMPT_LIMIT = 50;
    while (attempts < ATTEMPT_LIMIT) {
        logger_1.feedLogger.log(`REANNOUNCE`, `Attempt #${attempts + 1}: Querying tracker status...`);
        try {
            let trackers = await api_1.getTrackers(infohash);
            trackers.splice(0, 3);
            let working = trackers.some(tracker => tracker.status === 2);
            if (!working) {
                //We need to reannounce
                logger_1.feedLogger.log('REANNOUNCE', 'Need to reannounce. Sending request and sleeping...');
                await api_1.reannounce(infohash);
                await utilities_1.sleep(WAIT_TIME);
                attempts++;
            }
            else {
                logger_1.feedLogger.log('REANNOUNCE', 'Tracker is OK. Exiting...');
                break;
            }
        }
        catch (error) {
            logger_1.feedLogger.log('REANNOUNCE', 'Caught an error. Exiting...');
            process.exit(1);
        }
    }
};
//# sourceMappingURL=add_torrent.js.map