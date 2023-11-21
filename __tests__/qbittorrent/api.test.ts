import nock from 'nock';
import test from 'ava';

import { QbittorrentApi } from '../../src/qbittorrent/api.js';
import { randomBytes } from 'crypto';

test('getTorrents', async t => {
    const api = new QbittorrentApi('http://qbit:8080', 'cookie');

    const scope = nock('http://qbit:8080', {
        reqheaders: {
            'Cookie': 'cookie'
        }
    });

    const data = randomBytes(10).toString('hex');
    
    scope.get('/api/v2/torrents/info').reply(200, data);

    const got = await api.getTorrents();

    t.deepEqual(data, got);
})

test('getTorrentsWithParam', async t => {
    const api = new QbittorrentApi('http://qbit:8080', 'cookie');

    const scope = nock('http://qbit:8080', {
        reqheaders: {
            'Cookie': 'cookie'
        }
    });

    const data = randomBytes(10).toString('hex');
    
    scope.get('/api/v2/torrents/info?hashes=a|b').reply(200, data);

    const got = await api.getTorrents(['a', 'b']);

    t.deepEqual(data, got);
})

test('resumeTorrents', async t => {
    const api = new QbittorrentApi('http://qbit:8080', 'cookie');

    const scope = nock('http://qbit:8080', {
        reqheaders: {
            'Cookie': 'cookie'
        }
    });

    scope.post('/api/v2/torrents/resume', 'hashes=a|b').reply(200);

    await api.resumeTorrents([
        {
            hash: 'a',
        },
        {
            hash: 'b',
        }
    ]);

    // Make sure the scope was successfully called
    t.notThrows(() => {
        scope.done();
    });
})