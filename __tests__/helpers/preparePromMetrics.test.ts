import test from 'ava';
import { countTorrentStates } from '../../src/helpers/preparePromMetrics.js';
import { torrentFromApi } from '../../src/interfaces.js';

test('countTorrentStates', t => {
        let torrents = [
            {
                state: 'error'
            },
            {
                state: 'error'
            },
            {
                state: 'uploading'
            },
            {
                state: 'downloading'
            },
            {
                state: 'downloading'
            },
            {
                state: 'downloading'
            },
            {
                state: 'pausedUP'
            },
        ] as unknown as torrentFromApi[];

        const counted = countTorrentStates(torrents);

        t.deepEqual(counted.error, 2);
        // expect(counted.error).toEqual(2);
        // expect(counted.uploading).toEqual(1);
        // expect(counted.downloading).toEqual(3);
        // expect(counted.pausedUP).toEqual(1);
        // expect(counted.stalledDL).toEqual(0);
})
