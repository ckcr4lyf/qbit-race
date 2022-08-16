import sinon from 'sinon';
import test from 'ava';

import { newMockQbitApi } from '../../__mocks__/qbit.js';

import { tagErroredTorrents } from '../../src/racing/tag.js'

test('Sinon', t => {

    const x = sinon.fake();

    t.deepEqual(x.called, true);


})