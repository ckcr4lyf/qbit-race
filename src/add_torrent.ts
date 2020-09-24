import { login } from './qbittorrent/auth';
import { addTorrent, getTrackers, reannounce } from './qbittorrent/api'
import { sleep } from './helpers/utilities';
import { feedLogger } from './helpers/logger';
import { preRaceCheck } from './helpers/pre_race';
import { SETTINGS } from '../settings';

module.exports = async (args: string[]) => {

    const infohash = args[0].toLowerCase();
    const torrentName = args[1];
    const tracker = args[2];
    const path = args[3];
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
        await addTorrent(path);
    } catch (error) {
        process.exit(1);
    }

    await sleep(5000);
    feedLogger.log("ADD TORRENT",  "Getting trackers");
    let attempts = 0;

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
                feedLogger.log('REANNOUNCE', 'Tracker is OK. Exiting...');
                break;
            }
        } catch (error) {
            feedLogger.log('REANNOUNCE', 'Caught an error. Exiting...');
            process.exit(1);
        }
    }
    
    //We got here but failed reannounce failed. 
    //Delete. 

    
}