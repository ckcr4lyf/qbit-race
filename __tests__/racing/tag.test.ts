import sinon from 'sinon';
import test from 'ava';

import { newMockQbitApi } from '../../__mocks__/qbit.js';

import { tagErroredTorrents } from '../../src/racing/tag.js'

test('tagWhenNoTorrents', async t => {

    const mockApi = newMockQbitApi();
    // Test with no torrents
    const first = sinon.stub(mockApi, 'getTorrents').resolves([]);

    const result = await tagErroredTorrents(mockApi, true);
    t.deepEqual(result, undefined);
    t.deepEqual(first.called, true);
})