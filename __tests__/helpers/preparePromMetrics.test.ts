import { countTorrentStates } from '../../src/helpers/preparePromMetrics';
import { torrentFromApi } from '../../src/interfaces';

describe('countTorrentStates', () => {
    it('Should count states correctly', () => {
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
        expect(counted.error).toEqual(2);
        expect(counted.uploading).toEqual(1);
        expect(counted.downloading).toEqual(3);
        expect(counted.pausedUP).toEqual(1);
        expect(counted.stalledDL).toEqual(0);
    })
})
