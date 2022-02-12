import path from 'path';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

import { getTorrentMetainfo } from '../../src/helpers/torrent';

describe('getTorrentMetaInfo', () => {
    it('Should work as expected', () => {
        const torrent = fs.readFileSync(path.join(__dirname, '100MB.bin.torrent'));
        const metainfo = getTorrentMetainfo(torrent);

        expect(metainfo).toEqual({
            infohash: 'c04d04e869f7f53f212b28401b381274f2091d86',
            name: '100MB.bin',
            tracker: 'sub.faketracker.com'
        })
    })
})