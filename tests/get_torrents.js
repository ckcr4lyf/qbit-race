const { setTesting } = require('../build/config');
setTesting(true);

const { login } = require('../build/qbittorrent/auth');
const { getTorrents } = require('../build/qbittorrent/api');
const { preRaceCheck } = require('../build/helpers/pre_race')

const SEEDING_STATES = ['uploading', 'stalledUP', 'forcedUP'];

(async() => {

    await login();
    const okay = await preRaceCheck();
    console.log(okay);
    /*
    let torrents = await getTorrents();
    torrents = torrents.map(({name, hash, state, added_on}) => ({name, hash, state, added_on}));
    const downloading = torrents.filter(torrent => torrent.state === 'downloading');
    const seeding = torrents.filter(torrent => SEEDING_STATES.some(state => state === torrent.state));
    const paused = torrents.filter(torrent => torrent.state.slice(0, 6) === 'paused');

    //There could be an edge case wherein a torrent was added, removed from TL for some rule
    //Then it will be stalled for a long time
    //We should not count this when deciding to skip or not. 

    //Solution = reannounce deletes it after x-time.

    console.log(torrents);
    // console.log({ downloading, paused, seeding });
    */
})();