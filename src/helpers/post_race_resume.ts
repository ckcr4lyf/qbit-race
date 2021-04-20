import { info } from 'console';
import { SETTINGS } from '../../settings';
import { sendMessage } from '../discord/api';
import { completeMessage } from '../discord/messages';
import { torrentFromApi } from '../interfaces';
import { getTorrentInfo, getTorrents, getTrackers, resumeTorrents, setCategory } from "../qbittorrent/api";
import { login } from "../qbittorrent/auth";
import { feedLogger } from "./logger";
import { resume } from './resume';

/**
 * postRaceResume runs after a race completes and resumes torrents.
 * 
 * It first calls getTorrents to get a list, and then checks to see if any are still downloading.
 * It also checks if any are stalled / in reannounce loop.
 * If nothing is pending, it will resume all torrents.
 */
export const postRaceResume = async (infohash: string, tracker: string) => {

    let torrents: torrentFromApi[];
    let t1 = Date.now();

    try {
        await login();
    } catch (error) {
        console.log(`Failed to login. Exiting...`);
        process.exit(1);
    }

    let t2 = Date.now();
    feedLogger.log('AUTH', `Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);

    // Check if this torrent's category is in the rename list
    // In case they are on old settings, skip it
    if (SETTINGS.CATEGORY_FINISH_CHANGE !== undefined){
        const torrentInfo = await getTorrentInfo(infohash);
        const newCategoryName = SETTINGS.CATEGORY_FINISH_CHANGE[torrentInfo.category];

        // Check if there was a rule for it or not
        if (newCategoryName !== undefined){
            try {
                await setCategory(infohash, newCategoryName);
                feedLogger.log('POST RACE', `Changed category for ${infohash} from ${torrentInfo.category} to ${newCategoryName}`);
            } catch (error) {
                feedLogger.log('POST RACE', `Failed to change category for ${infohash} from ${torrentInfo.category} to ${newCategoryName}`);
            }
        }
    }

    feedLogger.log('POST RACE', `Getting torrent list`);

    try {
        torrents = await getTorrents();
    } catch (error) {
        feedLogger.log('POST RACE', `Failed to get torrents from qBittorrent`);
        process.exit(1);
    }

    //Get the stats for this torrent and send to discord
    const { enabled } = SETTINGS.DISCORD_NOTIFICATIONS || { enabled: false }

    if (enabled === true){
        let torrent = torrents.find(t => t.hash === infohash);

        if (torrent === undefined){
            feedLogger.log('POST RACE', `Unable to find completed torrent (${infohash}) in array. Exiting...`)
            process.exit(1);
        }

        try {
            feedLogger.log('POST RACE', 'Sending notification to deluge...');
            await sendMessage(completeMessage(torrent.name, torrent.tags.split(','), torrent.size, torrent.ratio));
        } catch (error){
            feedLogger.log('POST RACE', 'Failed to send notification to Discord');
        }
    }

    // handle the resume part
    await resume('POST RACE', torrents);    
}