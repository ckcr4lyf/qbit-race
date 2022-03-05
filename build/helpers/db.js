import * as path from 'path';
import { LowSync, JSONFileSync } from 'lowdb';
import { fileURLToPath } from 'node:url';
import { EVENTS } from './constants.js';
import { SETTINGS } from '../../settings.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filename = path.join(__dirname, '../../stats.json');
const adapter = new JSONFileSync(filename);
const db = new LowSync(adapter);
// Initial default setup
db.read();
db.data || (db.data = {
    added: [],
    completed: [],
    torrents: [],
});
export const addEventToDb = (event) => {
    if (event.eventType === EVENTS.ADDED) {
        db.data.added.push(event);
    }
    else if (event.eventType === EVENTS.COMPLETED) {
        db.data.completed.push(event);
    }
    if (SETTINGS.DB_ENABLED === true) {
        db.write();
    }
};
export const addTorrentToDb = (torrent) => {
    db.data.torrents.push(torrent);
    if (SETTINGS.DB_ENABLED === true) {
        db.write();
    }
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