import { QbittorrentApi } from "../qbittorrent/api.js";
import { Settings } from "../utils/config";
import { getLoggerV3 } from "../utils/logger.js";

export const postRaceResumeV2 = async (api: QbittorrentApi, settings: Settings, infohash: string) => {

    const logger = getLoggerV3();

    const torrentInfo = await api.getTorrent(infohash);

    if (torrentInfo.category in settings.CATEGORY_FINISH_CHANGE){

        const newCategory = settings.CATEGORY_FINISH_CHANGE[torrentInfo.category];
        logger.debug(`Found entry in category change map. Changing from ${torrentInfo.category} to ${newCategory}`);
        

    }




}