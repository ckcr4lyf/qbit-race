import sinon from 'sinon';
import test from 'ava';

import { getMockWorkingTrackers, newMockQbitApi } from '../../__mocks__/qbit.js';

import { tagErroredTorrents } from '../../src/racing/tag.js'

test('tagWhenNoTorrents', async t => {

    const mockApi = newMockQbitApi();
    // Test with no torrents
    const first = sinon.stub(mockApi, 'getTorrents').resolves([]);

    const result = await tagErroredTorrents(mockApi, true);
    t.deepEqual(result, undefined);
    t.deepEqual(first.called, true);
})

test('tagWhenAllWorkingTorrents', async t => {

    const mockApi = newMockQbitApi();
    // Test with torrents
    const first = sinon.stub(mockApi, 'getTorrents').resolves([
        {
            hash: 'ABCD',
        },
        {
            hash: 'GGWP'
        }
    ] as any);

    const second = sinon.stub(mockApi, 'getTrackers').onCall(0).resolves(getMockWorkingTrackers()).onCall(1).resolves(getMockWorkingTrackers())

    const result = await tagErroredTorrents(mockApi, true);
    t.deepEqual(result, undefined);
    t.deepEqual(first.called, true);
    t.deepEqual(second.called, true);
    t.deepEqual(second.calledWith('ABCD'), true);
    t.deepEqual(second.calledWith('GGWP'), true);
})