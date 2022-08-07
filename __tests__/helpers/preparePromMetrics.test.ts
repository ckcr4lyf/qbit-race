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

        // Skip all the possible states
        const counted = countTorrentStates(torrents);
        const countedPartial = { 
            error: counted.error,
            uploading: counted.uploading,
            downloading: counted.downloading,
            pausedUP: counted.pausedUP,
            stalledDL: counted.stalledDL,
         }

        const expected = {
            'error': 2,
            'uploading': 1,
            'downloading': 3,
            'pausedUP': 1,
            'stalledDL': 0,
        };

        t.deepEqual(countedPartial, expected);
})
