import { login } from './qbittorrent/auth';
import { addTags, getTorrents, getTrackers } from './qbittorrent/api';
import { feedLogger } from './helpers/logger';

/**
 * tagErroredTorrents gets a list of torrents from qBit, and then traverses their tracker.
 * If for any of them, apart from DHT, PEX etc. not a single tracker is status 2 (working)
 * It will tag them as an errored torrent
 * Requested by Xan
 */

 export const tagErroredTorrents = async (args: string[]) => {

    const dryRun = args.some(arg => arg === '--dry-run');

    if (dryRun === true){
        feedLogger.log('FLAGS', `--dry-run specified. Will not tag any torrents!`);
    }

    let torrents: any[];
    let t1 = Date.now();

    try {
        await login();
    } catch (error){
        feedLogger.log('AUTH', 'Failed to login to qBittorrent');
        process.exit(1);
    }

    //We logged in. Get the torrents

    try {
        torrents = await getTorrents();
    } catch (error){
        feedLogger.log('GET TORRENTS', 'Failed to get torrents from qBittorrent');
        process.exit(1);
    }

    //Map it to the useful shit, aka just infohashes (and name maybe).
    //This is actually pointless but map looks cool so yolo. It may even free some memory
    //When the GC runs
    torrents = torrents.map(({ name, hash }) => ({ name, hash }));
    let toTag: string[] = [];
    //Loop over them 
    for (const torrent of torrents){
        
        let trackers: any[] = await getTrackers(torrent.hash);
        trackers.splice(0, 3);
        let working = trackers.some(tracker => tracker.status === 2);

        if (!working){
            feedLogger.log('CHECK', `[${torrent.hash}] tracker error for ${torrent.name}`);
            toTag.push(torrent);
        }
    }

    //Now let's tag them
    if (toTag.length === 0){
        feedLogger.log('TAG', 'No errored torrents to tag...');
        process.exit(0);
    }

    if (dryRun === true){
        feedLogger.log('TAG', 'Finished Dry Run. Exiting...');
        return;
    }

    feedLogger.log('TAG', `Tagging ${toTag.length} torrents...`);

    try {
        await addTags(toTag, ['error']);
    } catch (error){
        feedLogger.log('TAG', 'Failed to set tags');
        process.exit(1);
    }

    feedLogger.log('TAG', `Successfully tagged ${toTag.length} torrents!`);
 }