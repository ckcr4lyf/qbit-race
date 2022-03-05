import * as path from 'path';

import { LowSync, JSONFileSync } from 'lowdb';
import { torrentDbInfo, torrentStatusEvent } from '../interfaces.js';
import { fileURLToPath } from 'node:url';
import { EVENTS } from './constants.js';
import { SETTINGS } from '../../settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type QbitStatsSchema = {
    added: torrentStatusEvent[];
    completed: torrentStatusEvent[];
    torrents: torrentDbInfo[];
};

const filename = path.join(__dirname, '../../stats.json');
const adapter = new JSONFileSync<QbitStatsSchema>(filename);
const db = new LowSync<QbitStatsSchema>(adapter);

// Initial default setup
db.read();
db.data ||= {
    added: [],
    completed: [],
    torrents: [],
};

export const addEventToDb = (event: torrentStatusEvent) => {
    if (event.eventType === EVENTS.ADDED){
        db.data.added.push(event);    
    } else if (event.eventType === EVENTS.COMPLETED){
        db.data.completed.push(event);
    }

    if (SETTINGS.DB_ENABLED === true){
        db.write();
    }
}

export const addTorrentToDb = (torrent: torrentDbInfo) => {
    db.data.torrents.push(torrent);

    if (SETTINGS.DB_ENABLED === true){
        db.write();
    }
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