import { setLogfile } from '../build/config.js';
setLogfile('tests.log');
import { login } from '../build/qbittorrent/auth,js'
import { login } from '../build/qbittorrent/auth.js';
import { getTorrents, getTrackers, addTags } from '../build/qbittorrent/api.js';
import { preRaceCheck } from '../build/helpers/pre_race.js'

const SEEDING_STATES = ['uploading', 'stalledUP', 'forcedUP'];

(async() => {

    await login();
    let torrents = await getTorrents();
    const torrent = torrents[0];
    console.log(torrent);
    return;
    for (let x = 0; x < torrents.length; x++){
        const torrent = torrents[x];
        let trackers = await getTrackers(torrent.hash);
        trackers.splice(0, 3); //Remove DHT, PEX & LSD
        // const tags = trackers.map( ({ url }) => {
        //     let x = new URL(url)
        //     return x.hostname;
        // });
        const tags = trackers.map(({ url }) => new URL(url).hostname);
        await addTags([torrent], tags);
    }

    // console.log(tags);
    // console.log(trackers);
    // const okay = await preRaceCheck();
    // console.log(okay);
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