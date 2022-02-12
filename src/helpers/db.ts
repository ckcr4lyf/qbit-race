import * as path from 'path';

import { LowSync, JSONFileSync } from 'lowdb';
import { torrentDbInfo, torrentStatusEvent } from '../interfaces.js';
import { EVENTS } from './constants.js';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Schema = {
    events: torrentStatusEvent[];
    torrents: torrentDbInfo[];
};

const filename = path.join(__dirname, '../../stats.json');
const adapter = new JSONFileSync<Schema>(filename);
const db = new LowSync<Schema>(adapter);

// Initial default setup
db.read();
db.data ||= {
    events: [],
    torrents: [],
};

export const addEventToDb = (event: torrentStatusEvent) => {
    db.data.events.push(event);
    db.write();
}

export const addTorrentToDb = (torrent: torrentDbInfo) => {
    db.data.torrents.push(torrent);
    db.write();
}

export const useless = () => {
    let trackers = new Set<string>();
    db.data.torrents.forEach(tInfo => {
        for (let t of tInfo.trackers){
            trackers.add(t);
        }
    });

    console.log(trackers);
}