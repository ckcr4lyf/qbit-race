import { info } from 'console';
import { SETTINGS } from '../../settings';
import { torrentFromApi } from '../interfaces';
import { resumeTorrents } from "../qbittorrent/api";
import { feedLogger } from "./logger";

export const resume = async (logPrefix: string, torrents: torrentFromApi[]) => {

    feedLogger.log(logPrefix, `Getting torrent list`);
    const reannounceYoungest = Date.now() - (SETTINGS.REANNOUNCE_INTERVAL * SETTINGS.REANNOUNCE_LIMIT); 

    for (let x = 0; x < torrents.length; x++){

        const torrent = torrents[x];

        if (torrent.state === 'downloading'){
            feedLogger.log(logPrefix, `We are still downloading, not resuming rest.`);
            return; //We do not want to resume, since something else is downloading.
        }

        if (torrent.state === 'stalledDL' && (torrent.added_on * 1000) > reannounceYoungest){
            feedLogger.log(logPrefix, `There is a torrent in reannounce phase, not resuming rest.`)
            return; //This torrent is also still in the reannounce phase
        }

    }

    const paused = torrents.filter(torrent => torrent.state === 'pausedUP');
    
    if (paused.length === 0){
        feedLogger.log(logPrefix, `No downloading, nothing to resume either.`);
        return;
    }

    feedLogger.log(logPrefix, `No downloading torrents. Resuming ${paused.length} torrents...`);

    try {
        await resumeTorrents(paused);
    } catch (error) {
        feedLogger.log(logPrefix, `Failed to resume torrents.`);
        process.exit(1);
    }

    feedLogger.log(logPrefix, `Resumed all torrents. Exiting...`); 
}