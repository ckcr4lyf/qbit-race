import * as path from 'path';

import * as lowdb from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import { torrentDbInfo, torrentStatusEvent } from '../interfaces';
import { EVENTS } from './constants';

type Schema = {
    events: torrentStatusEvent[];
    torrents: torrentDbInfo[];
};

const adapter = new FileSync<Schema>(path.join(__dirname, '../../stats.json'));
const db = lowdb(adapter);

db.defaults({ 
    events: [],
    torrents: [],
});

export const addEventToDb = (event: torrentStatusEvent) => {
    db.get('events').push(event).write();
}

export const addTorrentToDb = (torrent: torrentDbInfo) => {
    db.get('torrents').push(torrent).write();
}