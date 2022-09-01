import sinon from 'sinon';
import test from 'ava';

import { concurrentRacesCheck } from '../../src/racing/preRace.js';
import { defaultSettings } from '../../src/utils/config.js';

test('concurrentRacesNoTorrents', t => {
    const settings = { ...defaultSettings };
    const result = concurrentRacesCheck(settings, [])
    t.deepEqual(result, true);
});