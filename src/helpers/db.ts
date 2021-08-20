import * as path from 'path';

import { LowSync, JSONFileSync } from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import { torrentDbInfo, torrentStatusEvent } from '../interfaces';
import { EVENTS } from './constants';

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