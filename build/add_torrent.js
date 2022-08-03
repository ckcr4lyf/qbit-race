import { login } from './qbittorrent/auth.js';
import { addTags, addTorrent, deleteTorrents, getTorrentInfo, getTorrents, getTrackers, reannounce } from './qbittorrent/api.js';
import { sleep } from './helpers/utilities.js';
import { logger } from './helpers/logger.js';
import { preRaceCheck } from './helpers/pre_race.js';
import { SETTINGS } from '../settings.js';
import { sendMessage } from './discord/api.js';
import { addMessage } from './discord/messages.js';
import { resume } from './helpers/resume.js';
import { getTorrentMetainfo } from './helpers/torrent.js';
import * as fs from 'fs';
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
        metainfo = getTorrentMetainfo(torrentFile);
    }
    catch (e) {
        logger.error(`Failed to read/parse torrent from file`);
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
                logger.error('--category set but the category is missing.');
                break;
            }
        }
    }
    let t1 = Date.now();
    try {
        await login();
    }
    catch (error) {
        logger.error(`Failed to login. Exiting...`);
        process.exit(1);
    }
    let t2 = Date.now();
    logger.info(`Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    logger.info('Performing Pre Race check...');
    const okay = await preRaceCheck();
    if (okay === false) {
        logger.info(`Conditions not met. Skipping ${metainfo.name}`);
        process.exit(0); //it is a soft exit. 
    }
    logger.info(`Adding torrent ${metainfo.name}`);
    try {
        await addTorrent(torrentFile, category);
    }
    catch (error) {
        process.exit(1);
    }
    //Wait for torrent to register in Qbit, initial announce.
    await sleep(5000);
    //Now we get the torrent's trackers, which will let us set the tags.
    let tags = [];
    try {
        let trackers = await getTrackers(metainfo.infohash);
        trackers.splice(0, 3);
        tags = trackers.map(({ url }) => new URL(url).hostname);
        logger.info(`Adding ${tags.length} tags.`);
        await addTags([{ hash: metainfo.infohash }], tags);
    }
    catch (error) {
        logger.error(`Failed to add tags. Error code ${error}`);
    }
    //We also want to get the size of the torrent, for the notification.
    let torrent;
    try {
        torrent = await getTorrentInfo(metainfo.infohash);
    }
    catch (error) {
        process.exit(1);
    }
    //Now we move anto reannounce
    logger.info("Starting reannounce check...");
    let attempts = 0;
    let announceOK = false;
    while (attempts < SETTINGS.REANNOUNCE_LIMIT) {
        logger.info(`Attempt #${attempts + 1}: Querying tracker status...`);
        try {
            let trackers = await getTrackers(metainfo.infohash);
            trackers.splice(0, 3);
            let working = trackers.some(tracker => tracker.status === 2);
            if (!working) {
                //We need to reannounce
                logger.info('Need to reannounce. Sending request and sleeping...');
                await reannounce(metainfo.infohash);
                await sleep(SETTINGS.REANNOUNCE_INTERVAL);
                attempts++;
            }
            else {
                announceOK = true;
                logger.info('Tracker is OK. Exiting...');
                break;
            }
        }
        catch (error) {
            logger.error('Caught an error. Exiting...');
            process.exit(1);
        }
    }
    //We got here but failed reannounce failed. Delete it.
    if (announceOK === false) {
        logger.info(`Did not get an OK from tracker even after ${SETTINGS.REANNOUNCE_LIMIT} attempts. Deleting...`);
        await deleteTorrents([{ hash: metainfo.infohash }]);
        // Resume any that were paused
        logger.info('Going to resume any paused torrents...');
        const torrents = await getTorrents();
        resume(torrents);
    }
    else {
        //Send message to discord (if enabled)
        const { enabled } = SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false };
        if (enabled === true) {
            try {
                await sendMessage(addMessage(torrent.name, tags, torrent.size, attempts));
            }
            catch (error) {
                process.exit(1);
            }
        }
    }
};
//# sourceMappingURL=add_torrent.js.map