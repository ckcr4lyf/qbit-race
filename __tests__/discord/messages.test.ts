import crypto from 'node:crypto';
import test from 'ava';

import { buildMessageBody, buildTorrentAddedBody } from '../../src/discord/messages.js';

const fakeDiscSettings = {
    enabled: true,
    botUsername: 'bot',
    botAvatar: 'image.png'
}

test('buildMessageBody', t => {
    const aVal = crypto.randomBytes(10).toString('hex');
    const bVal = crypto.randomBytes(10).toString('hex');
    const partialData: any = { a: aVal, b: bVal };

    const want = {
        a: aVal,
        b: bVal,
        username: 'bot',
        avatar_url: 'image.png'
    };

    const got = buildMessageBody(fakeDiscSettings, partialData);

    t.deepEqual(got, want);
})

test('buildTorrentAddedBody', t => {
    const torrentInfo: any = {
        size: 2.5 * 1024 * 1024, // 2.5MiB
        name: 'arch',
        trackers: ['archlinux.org'],
        reannounceCount: 3,
    };

    const want = {
        username: 'bot',
        avatar_url: 'image.png',
        content: `Added arch (2.50 MiB)`,
        embeds: [
            {
                title: 'arch',
                description: 'Added to qBittorrent',
                thumbnail: {
                    url: 'image.png',
                },
                fields: [
                    {
                        name: 'Tracker',
                        value: 'archlinux.org',
                    },
                    {
                        name: 'Size',
                        value: '2.50 MiB'
                    },
                    {
                        name: 'Reannounce Count',
                        value: '3'
                    }
                ]
            }
        ]
    }

    const got = buildTorrentAddedBody(fakeDiscSettings, torrentInfo);

    t.deepEqual(got, want);
})