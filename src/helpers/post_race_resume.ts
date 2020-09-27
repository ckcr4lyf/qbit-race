import { SETTINGS } from '../../settings';
import { sendMessage } from '../discord/api';
import { completeMessage } from '../discord/messages';
import { getTorrents, getTrackers, resumeTorrents } from "../qbittorrent/api";
import { login } from "../qbittorrent/auth";
import { feedLogger } from "./logger";

/**
 * postRaceResume runs after a race completes and resumes torrents.
 * 
 * It first calls getTorrents to get a list, and then checks to see if any are still downloading.
 * It also checks if any are stalled / in reannounce loop.
 * If nothing is pending, it will resume all torrents.
 */
export const postRaceResume = async (infohash: string, tracker: string) => {

    // feedLogger.log('POST RACE', `Called with infohash=${infohash}&tracker=${tracker}`);
    let torrents: any[];
    let t1 = Date.now();

    try {
        await login();
    } catch (error) {
        console.log(`Failed to login. Exiting...`);
        process.exit(1);
    }

    let t2 = Date.now();
    feedLogger.log('AUTH', `Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    feedLogger.log('POST RACE', `Getting torrent list`);

    try {
        torrents = await getTorrents();
    } catch (error) {
        feedLogger.log('POST RACE', `Failed to get torrents from qBittorrent`);
        process.exit(1);
    }

    torrents = torrents.map(({ name, hash, state, added_on, ratio, size, tags }) => ({ name, hash, state, added_on, ratio, size, tags }));
    const reannounceYoungest = Date.now() - (SETTINGS.REANNOUNCE_INTERVAL * SETTINGS.REANNOUNCE_LIMIT); 

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

    for (let x = 0; x < torrents.length; x++){

        const torrent = torrents[x];

        if (torrent.state === 'downloading'){
            feedLogger.log('POST RACE', `We are still downloading, not resuming rest.`);
            return; //We do not want to resume, since something else is downloading.
        }

        if (torrent.state === 'stalledDL' && (torrent.added_on * 1000) > reannounceYoungest){
            feedLogger.log('POST RACE', `There is a torrent in reannounce phase, not resuming rest.`)
            return; //This torrent is also still in the reannounce phase
        }

    }

    const paused = torrents.filter(torrent => torrent.state === 'pausedUP');
    
    if (paused.length === 0){
        feedLogger.log('POST RACE', `No downloading, nothing to resume either.`);
        return;
    }

    feedLogger.log('POST RACE', `No downloading torrents. Resuming ${paused.length} torrents...`);

    try {
        await resumeTorrents(paused);
    } catch (error) {
        feedLogger.log('POST RACE', `Failed to resume torrents.`);
        process.exit(1);
    }

    feedLogger.log('POST RACE', `Resumed all torrents. Exiting...`);    
}