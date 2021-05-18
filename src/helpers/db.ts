import * as path from 'path';

import * as lowdb from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import { torrentStatusEvent } from '../interfaces';

type Schema = {
    events: torrentStatusEvent[];
};

const adapter = new FileSync<Schema>(path.join(__dirname, '../../stats.json'));
const db = lowdb(adapter);
db.defaults({ events: [] });

export const addEvent = (infohash: string, size: number, uploaded: number, downloaded: number, ratio: number) => {

    const event: torrentStatusEvent = {
        infohash: infohash,
        size: size,
        uploaded: uploaded,
        downloaded: downloaded,
        ratio: ratio,        
    }

    db.get('events').push(event).write();
}