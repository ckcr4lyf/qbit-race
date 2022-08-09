import crypto from 'node:crypto';
import test from 'ava';

import { buildMessageBody } from '../../src/discord/messages.js';

test('buildMessageBody', t => {
    const aVal = crypto.randomBytes(10).toString('hex');
    const bVal = crypto.randomBytes(10).toString('hex');
    const partialData: any = { a: aVal, b: bVal };

    const fakeDiscSettings = {
        enabled: true,
        botUsername: 'bot',
        botAvatar: 'image.png'
    }

    const want = {
        a: aVal,
        b: bVal,
        username: 'bot',
        avatar_url: 'image.png'
    };

    const got = buildMessageBody(fakeDiscSettings, partialData);

    t.deepEqual(got, want);
})