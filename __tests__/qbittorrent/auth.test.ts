import test from 'ava';
import nock from 'nock';

import { QBITTORRENT_SETTINGS } from '../../src/utils/config.js'
import { loginV2 } from '../../src/qbittorrent/auth.js';


test('loginV2', async t => {
    const fakeSettings: QBITTORRENT_SETTINGS = {
        url: 'http://qbit:8080',
        username: 'admin',
        password: 'adminadmin'
    }

    const scope = nock(fakeSettings.url);
    
    scope.post('/api/v2/auth/login', {
        username: 'admin',
        password: 'adminadmin'
    }).reply(200, {}, {
        'set-cookie': 'SID=1234'
    });
    
    scope.get('/api/v2/app/version').reply(200, 'v4');
    const api = await loginV2(fakeSettings);

    //@ts-ignore - client is private but we want to access for testing
    t.deepEqual(api.client.defaults.headers.Cookie, 'SID=1234');
    //@ts-ignore - client is private but we want to access for testing
    t.deepEqual(api.client.defaults.baseURL, 'http://qbit:8080');
    t.deepEqual(scope.isDone(), true);
})