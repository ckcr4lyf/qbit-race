import { getTorrents, pauseTorrents } from '../qbittorrent/api'
import { feedLogger } from './logger';
import { SEEDING_STATES } from './constants';
import { SETTINGS } from '../../settings';
import { torrentFromApi } from '../interfaces';

export const preRaceCheck = () => {

    return new Promise( async (resolve, reject) => {
        feedLogger.log('PRE RACE', `Getting torrent list`);
        let torrents: torrentFromApi[];
    
        try {
            torrents = await getTorrents();
        } catch (error){
            feedLogger.log('PRE RACE', `Failed to get torrents from qBittorrent`);
            process.exit(1);
        }

        // torrents = torrents.map(({ name, hash, state, added_on, ratio, category, tags }) => ({ name, hash, state, added_on, ratio, category, tags }));

        if (SETTINGS.CONCURRENT_RACES !== -1){
            const downloading = torrents.filter(torrent => torrent.state === 'downloading');

            if (downloading.length > SETTINGS.CONCURRENT_RACES){
                resolve(false);
                return;
            }

            feedLogger.log('PRE RACE', `Currently downloading ${downloading.length} torrents.`);

            //e.g. 5000 * 30 = 150000ms. Now - this number, is how old the oldest 
            //reannouncing torrent can be. Older than that it is a stalled torrent (seeder abandoned), and we will not count it. 
            const reannounceYoungest = Date.now() - (SETTINGS.REANNOUNCE_INTERVAL * SETTINGS.REANNOUNCE_LIMIT); 

            const stalledDL = torrents.filter(torrent => {
                
                if (torrent.state === 'stalledDL') {
                    if (SETTINGS.COUNT_STALLED_DOWNLOADS === true){
                        return true; //We dont care about ratio in this case. Stalled is stalled.
                    }

                    if ((torrent.added_on * 1000) > reannounceYoungest){
                        console.log('This is still in reannounce phase', torrent);
                        return true; //This is younger (timestamp is more) than limit. So it is probably still contacting tracker.
                    }

                    return false;
                } else {
                    return false;
                }
            });

            feedLogger.log('PRE RACE', `Currently there are ${stalledDL.length} stalled torrents, waiting for race to start`);

            if ((downloading.length + stalledDL.length) >= SETTINGS.CONCURRENT_RACES){
                resolve(false);
                return;
            }

        }

        //If we got here, downloading is not a problem. Let's pause those whuch we can
        if (SETTINGS.PAUSE_RATIO !== -1){
            const uploading = torrents.filter(torrents => SEEDING_STATES.some(state => state === torrents.state));
            feedLogger.log('PRE RACE', `Currently seeding ${uploading.length} torrents.`);

            const toPause = uploading.filter(torrent => {

                //If the ratio is bellow threshold, we will not pause it anyway.
                if (torrent.ratio < SETTINGS.PAUSE_RATIO){
                    feedLogger.log('PAUSE', `Ratio for ${torrent.name} is below threshold. Not pausing.`);
                    return false;
                }

                //Ratio is pausable. Check category next
                if (SETTINGS.PAUSE_SKIP_CATEGORIES.includes(torrent.category)){
                    feedLogger.log('PAUSE', `Category ${torrent.category} for ${torrent.name} is in the skip list. Will not pause!`);
                    return false;
                }

                //Finally check the tags for any overlap
                //If for some tag in skip list, torrent tags includes it, then skip
                const torrentTags = torrent.tags.split(',');

                if (SETTINGS.PAUSE_SKIP_TAGS.some(skipTag => torrentTags.includes(skipTag))){
                    feedLogger.log('PAUSE', `Torrent ${torrent.name} has tags (${torrent.tags}) in common with skip tags. Will not pause!`);
                    return false;
                }

                return true;
            })

            // Do not pause categories / tags that we have set to skip
            // const toPause = uploading.filter(torrent => torrent.ratio > SETTINGS.PAUSE_RATIO);
            feedLogger.log('PRE RACE', `Going to pause ${toPause.length} torrents.`);
            
            try {
                await pauseTorrents(toPause);
            } catch (error){
                feedLogger.log('PRE RACE', `Failed to pause torrents`);
                process.exit(1);
            }
            // console.log(toPause);
            //TODO: Pause all the torrents in toPause
        }
     
        //We are now ready to race!
        resolve(true);
    })
}