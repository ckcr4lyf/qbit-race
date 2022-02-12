import b from 'bencode';
import * as crypto from 'crypto';
/**
 * getTorrentMetaInfo
 * ---
 *
 * Takes in the raw .torrent to get:
 * - The torrent name
 * - The tracker
 * - The infohash (calculated by decoded .torrent, encoding info, and calculating the SHA-1 hash)
 *
 * @param torrentData The raw .torrent contents
 * @returns Metainfo about the torrent
 */
export const getTorrentMetainfo = (torrentData) => {
    const decodedData = b.decode(torrentData);
    if (typeof decodedData.info !== 'object') {
        throw new Error("NO_INFO");
    }
    if (Buffer.isBuffer(decodedData.info.name) !== true) {
        throw new Error("NO_NAME");
    }
    if (Buffer.isBuffer(decodedData.announce) !== true) {
        throw new Error("NO_ANNOUNCE");
    }
    const info = decodedData.info;
    const reEncodedInfo = b.encode(info);
    const torrentHash = crypto.createHash('sha1').update(reEncodedInfo).digest('hex');
    const torrentName = info.name.toString();
    const announce = new URL(decodedData.announce.toString());
    const tracker = announce.hostname;
    return {
        infohash: torrentHash,
        name: torrentName,
        tracker: tracker
    };
};
//# sourceMappingURL=torrent.js.map