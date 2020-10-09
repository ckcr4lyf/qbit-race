import { login } from './qbittorrent/auth';
import { addTags, addTorrent, deleteTorrents, getTorrentInfo, getTrackers, reannounce } from './qbittorrent/api'
import { sleep } from './helpers/utilities';
import { feedLogger } from './helpers/logger';
import { preRaceCheck } from './helpers/pre_race';
import { SETTINGS } from '../settings';
import { sendMessage } from './discord/api';
import { addMessage } from './discord/messages';

module.exports = async (args: string[]) => {

    const infohash = args[0].toLowerCase();
    const torrentName = args[1];
    const tracker = args[2];
    const path = args[3];
    let category = null;

    //Check if `--category` is present. Then the next argument is the category to set.
    for (let index = 4; index < args.length; index++){
        if (args[index] === '--category'){
            //The next one should be the actual category
            if (index + 1 < args.length){
                category = args[index + 1];
            } else {
                //They fucked up. Let them know, but dont error out (act as if not set).
                feedLogger.log('ARGS', '--category set but the category is missing.');
                break;
            }
        }
    }

    let t1 = Date.now();

    try {
        await login();
    } catch (error) {
        console.log(`Failed to login. Exiting...`);
        process.exit(1);
    }

    let t2 = Date.now();
    feedLogger.log('AUTH', `Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    feedLogger.log('PRE RACE', 'Performing Pre Race check...');
    const okay = await preRaceCheck();

    if (okay === false){
        feedLogger.log('PRE RACE', `Conditions not met. Skipping ${torrentName}`);
        process.exit(0); //it is a soft exit. 
    }

    feedLogger.log('ADD TORRENT', `Adding torrent ${torrentName}`);

    try {
        await addTorrent(path, category);
    } catch (error) {
        process.exit(1);
    }
    
    //Wait for torrent to register in Qbit, initial announce.
    await sleep(5000);

    //Now we get the torrent's trackers, which will let us set the tags.
    let tags: string[] = []

    try {
        let trackers: any[] = await getTrackers(infohash);
        trackers.splice(0, 3);
        tags = trackers.map(({ url }) => new URL(url).hostname);
        feedLogger.log('ADD TORRENT', `Adding ${tags.length} tags.`);
        await addTags([{ hash: infohash }], tags);
    } catch (error) {
        feedLogger.log('ADD TORRENT', `Failed to add tags. Error code ${error}`);
    }

    //We also want to get the size of the torrent, for the notification.
    let torrent: any;

    try {
        torrent = await getTorrentInfo(infohash);
    } catch (error){
        process.exit(1);
    }

    //Now we move anto reannounce
    // await sleep(5000);
    feedLogger.log("ADD TORRENT",  "Starting reannounce check...");
    let attempts = 0;
    let announceOK = false;

    while (attempts < SETTINGS.REANNOUNCE_LIMIT) {

        feedLogger.log(`REANNOUNCE`,  `Attempt #${attempts + 1}: Querying tracker status...`);
        
        try {
            let trackers: any[] = await getTrackers(infohash);
            trackers.splice(0, 3);
            let working = trackers.some(tracker => tracker.status === 2);

            if (!working) {
                //We need to reannounce
                feedLogger.log('REANNOUNCE', 'Need to reannounce. Sending request and sleeping...');
                await reannounce(infohash);
                await sleep(SETTINGS.REANNOUNCE_INTERVAL);
                attempts++;
            } else {
                announceOK = true;
                feedLogger.log('REANNOUNCE', 'Tracker is OK. Exiting...');
                break;
            }
        } catch (error) {
            feedLogger.log('REANNOUNCE', 'Caught an error. Exiting...');
            process.exit(1);
        }
    }
    
    //We got here but failed reannounce failed. Delete it.
    if (announceOK === false){
        feedLogger.log('REANNOUNCE', `Did not get an OK from tracker even after ${SETTINGS.REANNOUNCE_LIMIT} attempts. Deleting...`);
        await deleteTorrents([{ hash: infohash }]);
    } else {
        //Send message to discord (if enabled)
        const { enabled, botUsername, botAvatar } = SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false }
        if (enabled === true) {
            try {
                await sendMessage(addMessage(torrent.name, tags, torrent.size, attempts))
            } catch (error){
                process.exit(1);   
            }
        }
    }
}