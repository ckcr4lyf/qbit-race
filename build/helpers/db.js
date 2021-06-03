"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTorrentToDb = exports.addEventToDb = void 0;
const path = require("path");
const lowdb_1 = require("lowdb");
const filename = path.join(__dirname, '../../stats.json');
const adapter = new lowdb_1.JSONFileSync(filename);
const db = new lowdb_1.LowSync(adapter);
// Initial default setup
db.read();
db.data || (db.data = {
    events: [],
    torrents: [],
});
const addEventToDb = (event) => {
    db.data.events.push(event);
    db.write();
};
exports.addEventToDb = addEventToDb;
const addTorrentToDb = (torrent) => {
    db.data.torrents.push(torrent);
    db.write();
};
exports.addTorrentToDb = addTorrentToDb;
//# sourceMappingURL=db.js.map