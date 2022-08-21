import { QbittorrentApi, QbittorrentTorrent } from "../qbittorrent/api.js";
import { Settings } from "../utils/config";
import { getLoggerV3 } from "../utils/logger.js";

export const postRaceResumeV2 = async (api: QbittorrentApi, settings: Settings, infohash: string) => {

    const logger = getLoggerV3();

    const torrentInfo = await api.getTorrent(infohash);

    // Handle category change stuff if applicable
    if (torrentInfo.category in settings.CATEGORY_FINISH_CHANGE){
        const newCategory = settings.CATEGORY_FINISH_CHANGE[torrentInfo.category];
        logger.debug(`Found entry in category change map. Changing from ${torrentInfo.category} to ${newCategory}`);

        try {
            await api.setCategory(torrentInfo.hash, newCategory);
            logger.debug(`Successfully set category to ${newCategory}`);
        } catch (e){
            logger.error(`Failed to set category. ${e}`);
        }
    }

    let torrents: QbittorrentTorrent[];

    try {
        torrents = await api.getTorrents();
    } catch (e){
        logger.error(`Failed to get torrents list from API! ${e}`);
        process.exit(1);
    }

}