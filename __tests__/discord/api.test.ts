import test from 'ava';
import nock from 'nock';

import { sendMessageV2 } from '../../src/discord/api.js'

test('sendMessageV2', async t => {
    const fakeWebhook = `https://domain.com:4444/`;

    const scope = nock(fakeWebhook);
    scope.post('/webhook', { data: 'xd' }).reply(200, 'OK');

    const res = await sendMessageV2(`https://domain.com:4444/webhook`, { data: 'xd' });

    t.deepEqual(res.status, 200);
    t.deepEqual(res.data, 'OK');
})