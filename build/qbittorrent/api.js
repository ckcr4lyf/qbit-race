"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reannounce = exports.getTrackers = exports.addTorrent = exports.addTags = exports.deleteTorrents = exports.resumeTorrents = exports.pauseTorrents = exports.getTorrents = exports.getTorrentInfo = void 0;
const axios_1 = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const config_1 = require("../config");
const logger_1 = require("../helpers/logger");
exports.getTorrentInfo = (infohash) => {
    return new Promise((resolve, reject) => {
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/info`, {
            params: {
                hashes: infohash
            },
            headers: { 'Cookie': config_1.COOKIE }
        }).then(response => {
            // console.log(response.status);
            // console.log(response.data);
            resolve(response.data[0]);
        }).catch(error => {
            logger_1.feedLogger.log(`GET TORRENT INFO`, `Failed with error code ${error.response.status}`);
            reject(error.response.status);
        });
    });
};
exports.getTorrents = () => {
    return new Promise((resolve, reject) => {
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/info`, {
            headers: { 'Cookie': config_1.COOKIE }
        }).then(response => {
            // console.log(response.status);
            // console.log(response.data);
            resolve(response.data);
        }).catch(error => {
            logger_1.feedLogger.log(`GET TORRENTS`, `Failed with error code ${error.response.status}`);
            reject(error.response.status);
        });
    });
};
exports.pauseTorrents = (torrents) => {
    return new Promise((resolve, reject) => {
        if (torrents.length === 0) {
            resolve();
            return;
        }
        const infohashes = torrents.map(torrent => torrent.hash);
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/pause`, {
            params: {
                hashes: infohashes.join('|')
            },
            headers: { 'Cookie': config_1.COOKIE }
        }).then(response => {
            logger_1.feedLogger.log('PAUSE TORRENTS', `Successfully paused ${infohashes.length} torrents!`);
            resolve();
        }).catch(error => {
            logger_1.feedLogger.log('PAUSE TORRENTS', `Failed with error code ${error.response.status}`);
            reject();
        });
    });
};
exports.resumeTorrents = (torrents) => {
    return new Promise((resolve, reject) => {
        if (torrents.length === 0) {
            resolve();
            return;
        }
        const infohashes = torrents.map(torrent => torrent.hash);
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/resume`, {
            params: {
                hashes: infohashes.join('|')
            },
            headers: { 'Cookie': config_1.COOKIE }
        }).then(response => {
            logger_1.feedLogger.log('RESUME TORRENTS', `Successfully resumed ${infohashes.length} torrents!`);
            resolve();
        }).catch(error => {
            logger_1.feedLogger.log('RESUME TORRENTS', `Failed with error code ${error.response.status}`);
            reject();
        });
    });
};
exports.deleteTorrents = (torrents) => {
    return new Promise((resolve, reject) => {
        if (torrents.length === 0) {
            resolve();
            return;
        }
        const infohashes = torrents.map(torrent => torrent.hash);
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/delete`, {
            params: {
                hashes: infohashes.join('|'),
                deleteFiles: true
            },
            headers: { 'Cookie': config_1.COOKIE }
        }).then(response => {
            logger_1.feedLogger.log('DELETE', `Successfully deleted ${torrents.length} torrents.`);
            resolve();
        }).catch(error => {
            logger_1.feedLogger.log('DELETE', `Failed with error code ${error.response.status}`);
            reject();
        });
    });
};
exports.addTags = (torrents, tags) => {
    return new Promise((resolve, reject) => {
        if (torrents.length === 0) {
            resolve();
            return;
        }
        if (tags.length === 0) {
            resolve();
            return;
        }
        const infohashes = torrents.map(torrent => torrent.hash);
        // const payload = new FormData();
        // payload.append('hashes', infohashes.join('|'));
        // payload.append('tags', tags.join(','));
        let payload = `hashes=${infohashes.join('|')}&tags=${tags.join(',')}`;
        axios_1.default.request({
            method: 'POST',
            url: `http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/addTags`,
            data: payload,
            headers: {
                'Cookie': config_1.COOKIE,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(response => {
            logger_1.feedLogger.log('ADD TAGS', `Successfully added ${tags.length} tags to ${torrents.length} torrents.`);
            resolve();
        }).catch(error => {
            // console.log(error.response);
            logger_1.feedLogger.log('ADD TAGS', `Failed with error code ${error.response.status}`);
        });
    });
};
exports.addTorrent = (path) => {
    return new Promise((resolve, reject) => {
        let formData = new FormData();
        try {
            const torrentData = fs.readFileSync(path);
            formData.append("torrents", torrentData, 'dummy.torrent');
        }
        catch (error) {
            logger_1.feedLogger.log('ADD TORRENT', `Unable to read file ${path}`);
            reject();
        }
        axios_1.default.request({
            method: 'POST',
            url: `http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/add`,
            headers: Object.assign(Object.assign({ 'Cookie': config_1.COOKIE }, formData.getHeaders()), { 'Content-Length': formData.getLengthSync() //Because axios can't handle this. Wasted 2 hours trying to debug. Fuck.
             }),
            data: formData
        }).then(response => {
            logger_1.feedLogger.log(`ADD TORRENT`, `Successfully added to qBittorrent!`);
            resolve();
        }).catch(error => {
            logger_1.feedLogger.log("ADD TORRENT", `Failed with error code ${error.response.status}`);
            reject();
        });
    });
};
exports.getTrackers = (infohash) => {
    return new Promise((resolve, reject) => {
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/trackers`, {
            params: {
                hash: infohash
            },
            headers: {
                'Cookie': config_1.COOKIE
            }
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            logger_1.feedLogger.log(`GET TRACKERS`, `Failed with error code ${error.response.status}`);
            reject(error);
        });
    });
};
exports.reannounce = (infohash) => {
    return new Promise((resolve, reject) => {
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/reannounce`, {
            params: {
                hashes: infohash
            },
            headers: {
                'Cookie': config_1.COOKIE
            }
        }).then(response => {
            resolve();
        }).catch(error => {
            logger_1.feedLogger.log(`REANNOUNCE`, `Failed with error code ${error.response.status}`);
            reject(error);
        });
    });
};
//# sourceMappingURL=api.js.map