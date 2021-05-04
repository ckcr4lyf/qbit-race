import { SETTINGS } from '../../settings';
import { torrentFromApi } from '../interfaces';
import { resumeTorrents } from "../qbittorrent/api";
import { logger } from "./logger";

export const resume = async (torrents: torrentFromApi[]) => {

    const reannounceYoungest = Date.now() - (SETTINGS.REANNOUNCE_INTERVAL * SETTINGS.REANNOUNCE_LIMIT); 

    for (let x = 0; x < torrents.length; x++){

        const torrent = torrents[x];

        if (torrent.state === 'downloading'){
            logger.info(`We are still downloading, not resuming rest.`);
            return; //We do not want to resume, since something else is downloading.
        }

        if (torrent.state === 'stalledDL' && (torrent.added_on * 1000) > reannounceYoungest){
            logger.info(`There is a torrent in reannounce phase, not resuming rest.`)
            return; //This torrent is also still in the reannounce phase
        }

    }

    const paused = torrents.filter(torrent => torrent.state === 'pausedUP');
    
    if (paused.length === 0){
        logger.info(`No downloading, nothing to resume either.`);
        return;
    }

    logger.info(`No downloading torrents. Resuming ${paused.length} torrents...`);

    try {
        await resumeTorrents(paused);
    } catch (error) {
        logger.error(`Failed to resume torrents.`);
        process.exit(1);
    }

    logger.info(`Resumed all torrents. Exiting...`); 
}