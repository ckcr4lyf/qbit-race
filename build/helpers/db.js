"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTorrentToDb = exports.addEventToDb = void 0;
const path = require("path");
const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(path.join(__dirname, '../../stats.json'));
const db = lowdb(adapter);
db.defaults({
    events: [],
    torrents: [],
});
const addEventToDb = (event) => {
    db.get('events').push(event).write();
};
exports.addEventToDb = addEventToDb;
const addTorrentToDb = (torrent) => {
    db.get('torrents').push(torrent).write();
};
exports.addTorrentToDb = addTorrentToDb;
//# sourceMappingURL=db.js.map