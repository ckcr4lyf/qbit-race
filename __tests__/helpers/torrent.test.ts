import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import test from 'ava';
import { getTorrentMetainfo } from '../../src/helpers/torrent.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('getTorrentMetaInfo', t => {
    const torrent = fs.readFileSync(path.join(__dirname, '../../../__fixtures__/100MB.bin.torrent'));
    const metainfo = getTorrentMetainfo(torrent);

    const expected = {
        hash: 'c04d04e869f7f53f212b28401b381274f2091d86',
        name: '100MB.bin',
        tracker: 'sub.faketracker.com'
    };

    t.deepEqual(expected, metainfo);
})