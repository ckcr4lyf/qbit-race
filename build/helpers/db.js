import * as path from 'path';
import { LowSync, JSONFileSync } from 'lowdb';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filename = path.join(__dirname, '../../stats.json');
const adapter = new JSONFileSync(filename);
const db = new LowSync(adapter);
// Initial default setup
db.read();
db.data || (db.data = {
    events: [],
    torrents: [],
});
export const addEventToDb = (event) => {
    db.data.events.push(event);
    db.write();
};
export const addTorrentToDb = (torrent) => {
    db.data.torrents.push(torrent);
    db.write();
};
export const useless = () => {
    let trackers = new Set();
    db.data.torrents.forEach(tInfo => {
        for (let t of tInfo.trackers) {
            trackers.add(t);
        }
    });
    console.log(trackers);
};
//# sourceMappingURL=db.js.map