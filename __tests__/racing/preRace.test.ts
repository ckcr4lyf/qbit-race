import sinon from 'sinon';
import test from 'ava';

import { concurrentRacesCheck } from '../../src/racing/preRace.js';
import { defaultSettings } from '../../src/utils/config.js';
import { QbittorrentTorrent } from '../../src/qbittorrent/api.js';
import { TorrentState } from '../../src/interfaces.js';

test('concurrentRacesNoTorrents', t => {
    const settings = { ...defaultSettings };
    const result = concurrentRacesCheck(settings, [])
    t.deepEqual(result, true);
});

test('concurrentRacesAndDownloading', t => {
    const settings = { ...defaultSettings };
    settings.CONCURRENT_RACES = 2;
    const torrents: any[] = [
        {
            state: TorrentState.downloading
        },
        {
            state: TorrentState.downloading
        },
        {
            state: TorrentState.uploading
        }
    ];

    const result = concurrentRacesCheck(settings, torrents);
    t.deepEqual(result, false);
})

test('countStalledVeryOld', t => {
    const settings = { ...defaultSettings };
    settings.CONCURRENT_RACES = 2;
    settings.COUNT_STALLED_DOWNLOADS = true;
    const torrents: any[] = [
        {
            state: TorrentState.downloading
        },
        {
            state: TorrentState.stalledDL,
            added_on: 0,
        },
        {
            state: TorrentState.uploading
        }
    ];

    const result = concurrentRacesCheck(settings, torrents);
    t.deepEqual(result, false);
})