/**
 * Racing a torrent consists of a few steps:
 * 
 * # Case 1: qbit-race used to add a new torrent
 * 
 * [Pre addition]
 * 
 * 1. Get list of existing torrents
 * 2. Check concurrent racing rules to see if it is ok to add
 *    a. Skip race if existing torrents
 * 3. Pause torrents before adding
 * 4. Add torrent
 * 
 * [Post addition]
 * 5. Try and reannounce if applicable
 * 
 * [Successfully announce]
 * 6a. Discord message
 * 
 * [Fail to reannounce]
 * 6b. Delete torrent, resume existing torrents
 * 
 * # Case 2: qbit-race used to apply "race mode" to existing torrent
 * 
 * 1. Try and pause torrents
 * 2. Try and reannounce if applicable
 * 
 * [Successfully announce]
 * 3a. Discord message
 * 
 * [Fail to reannounce]
 * 3b. noop
 */

import { QbittorrentApi } from "../qbittorrent/api.js";
import { Settings } from "../utils/config.js";


/**
 * raceExisting will try and "race" and existing torrent, by:
 * 
 * * Pausing existing torrents
 * * Try and reannounce if applicable
 * @param api The qbittorrent API
 * @param settings Settings for checking pause ratio etc.
 * @param infohash Infohash of newly added torrent
 */
export const raceExisting = async (api: QbittorrentApi, settings: Settings, infohash: string) => {

}