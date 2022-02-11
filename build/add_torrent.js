"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./qbittorrent/auth");
const api_1 = require("./qbittorrent/api");
const utilities_1 = require("./helpers/utilities");
const logger_1 = require("./helpers/logger");
const pre_race_1 = require("./helpers/pre_race");
const settings_1 = require("../settings");
const api_2 = require("./discord/api");
const messages_1 = require("./discord/messages");
const resume_1 = require("./helpers/resume");
const torrent_1 = require("./helpers/torrent");
const fs = require("fs");
module.exports = async (args) => {
    // Arguments:
    // previous: [infohash] [torrentname] [tracker] [path]
    // new: [path]
    // const infohash = args[0].toLowerCase();
    // const torrentName = args[1];
    // const tracker = args[2];
    // const path = args[3];
    //TODO: Check if first param is infohash or path? Or no bw compatibility?...
    // Assume none at first.
    const path = args[0];
    let category = null;
    // We need to read the torrent file and get the metainfo
    let torrentFile;
    let metainfo;
    try {
        torrentFile = fs.readFileSync(path);
        metainfo = (0, torrent_1.getTorrentMetainfo)(torrentFile);
    }
    catch (e) {
        logger_1.logger.error(`Failed to read/parse torrent from file`);
        throw new Error("TORRENT_READ_FAIL");
    }
    //Check if `--category` is present. Then the next argument is the category to set.
    for (let index = 1; index < args.length; index++) {
        if (args[index] === '--category') {
            //The next one should be the actual category
            if (index + 1 < args.length) {
                category = args[index + 1];
            }
            else {
                //They fucked up. Let them know, but dont error out (act as if not set).
                logger_1.logger.error('--category set but the category is missing.');
                break;
            }
        }
    }
    let t1 = Date.now();
    try {
        await (0, auth_1.login)();
    }
    catch (error) {
        logger_1.logger.error(`Failed to login. Exiting...`);
        process.exit(1);
    }
    let t2 = Date.now();
    logger_1.logger.info(`Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    logger_1.logger.info('Performing Pre Race check...');
    const okay = await (0, pre_race_1.preRaceCheck)();
    if (okay === false) {
        logger_1.logger.info(`Conditions not met. Skipping ${metainfo.name}`);
        process.exit(0); //it is a soft exit. 
    }
    logger_1.logger.info(`Adding torrent ${metainfo.name}`);
    try {
        await (0, api_1.addTorrent)(torrentFile, category);
    }
    catch (error) {
        process.exit(1);
    }
    //Wait for torrent to register in Qbit, initial announce.
    await (0, utilities_1.sleep)(5000);
    //Now we get the torrent's trackers, which will let us set the tags.
    let tags = [];
    try {
        let trackers = await (0, api_1.getTrackers)(metainfo.infohash);
        trackers.splice(0, 3);
        tags = trackers.map(({ url }) => new URL(url).hostname);
        logger_1.logger.info(`Adding ${tags.length} tags.`);
        await (0, api_1.addTags)([{ hash: metainfo.infohash }], tags);
    }
    catch (error) {
        logger_1.logger.error(`Failed to add tags. Error code ${error}`);
    }
    //We also want to get the size of the torrent, for the notification.
    let torrent;
    try {
        torrent = await (0, api_1.getTorrentInfo)(metainfo.infohash);
    }
    catch (error) {
        process.exit(1);
    }
    //Now we move anto reannounce
    logger_1.logger.info("Starting reannounce check...");
    let attempts = 0;
    let announceOK = false;
    while (attempts < settings_1.SETTINGS.REANNOUNCE_LIMIT) {
        logger_1.logger.info(`Attempt #${attempts + 1}: Querying tracker status...`);
        try {
            let trackers = await (0, api_1.getTrackers)(metainfo.infohash);
            trackers.splice(0, 3);
            let working = trackers.some(tracker => tracker.status === 2);
            if (!working) {
                //We need to reannounce
                logger_1.logger.info('Need to reannounce. Sending request and sleeping...');
                await (0, api_1.reannounce)(metainfo.infohash);
                await (0, utilities_1.sleep)(settings_1.SETTINGS.REANNOUNCE_INTERVAL);
                attempts++;
            }
            else {
                announceOK = true;
                logger_1.logger.info('Tracker is OK. Exiting...');
                break;
            }
        }
        catch (error) {
            logger_1.logger.error('Caught an error. Exiting...');
            process.exit(1);
        }
    }
    //We got here but failed reannounce failed. Delete it.
    if (announceOK === false) {
        logger_1.logger.info(`Did not get an OK from tracker even after ${settings_1.SETTINGS.REANNOUNCE_LIMIT} attempts. Deleting...`);
        await (0, api_1.deleteTorrents)([{ hash: metainfo.infohash }]);
        // Resume any that were paused
        logger_1.logger.info('Going to resume any paused torrents...');
        const torrents = await (0, api_1.getTorrents)();
        (0, resume_1.resume)(torrents);
    }
    else {
        //Send message to discord (if enabled)
        const { enabled } = settings_1.SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false };
        if (enabled === true) {
            try {
                await (0, api_2.sendMessage)((0, messages_1.addMessage)(torrent.name, tags, torrent.size, attempts));
            }
            catch (error) {
                process.exit(1);
            }
        }
    }
};
//# sourceMappingURL=add_torrent.js.map