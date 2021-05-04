"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reannounce = exports.getTrackers = exports.addTorrent = exports.setCategory = exports.addTags = exports.deleteTorrents = exports.resumeTorrents = exports.pauseTorrents = exports.getTorrents = exports.getTorrentInfo = void 0;
const axios_1 = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const config_1 = require("../config");
const logger_1 = require("../helpers/logger");
const getTorrentInfo = (infohash) => {
    return new Promise((resolve, reject) => {
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/info`, {
            params: {
                hashes: infohash
            },
            headers: { 'Cookie': config_1.COOKIE }
        }).then(response => {
            resolve(response.data[0]);
        }).catch(error => {
            logger_1.logger.error(`Get torrent info API failed with error code ${error.response.status}`);
            reject(error.response.status);
        });
    });
};
exports.getTorrentInfo = getTorrentInfo;
const getTorrents = () => {
    return new Promise((resolve, reject) => {
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/info`, {
            headers: { 'Cookie': config_1.COOKIE }
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            logger_1.logger.error(`Get torrents API failed with error code ${error.response.status}`);
            reject(error.response.status);
        });
    });
};
exports.getTorrents = getTorrents;
const pauseTorrents = (torrents) => {
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
            logger_1.logger.info(`Successfully paused ${infohashes.length} torrents!`);
            resolve();
        }).catch(error => {
            logger_1.logger.error(`Pause torrents API failed with error code ${error.response.status}`);
            reject();
        });
    });
};
exports.pauseTorrents = pauseTorrents;
const resumeTorrents = (torrents) => {
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
            logger_1.logger.info(`Successfully resumed ${infohashes.length} torrents!`);
            resolve();
        }).catch(error => {
            logger_1.logger.error(`Resume torrents API failed with error code ${error.response.status}`);
            reject();
        });
    });
};
exports.resumeTorrents = resumeTorrents;
const deleteTorrents = (torrents) => {
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
            logger_1.logger.info(`Successfully deleted ${torrents.length} torrents.`);
            resolve();
        }).catch(error => {
            logger_1.logger.error(`Delete torrents API failed with error code ${error.response.status}`);
            reject();
        });
    });
};
exports.deleteTorrents = deleteTorrents;
const addTags = (torrents, tags) => {
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
            logger_1.logger.info(`Successfully added ${tags.length} tags to ${torrents.length} torrents.`);
            resolve();
        }).catch(error => {
            logger_1.logger.error(`Add tags API failed with error code ${error.response.status}`);
        });
    });
};
exports.addTags = addTags;
const setCategory = (infohash, category) => {
    return new Promise((resolve, reject) => {
        let payload = `hashes=${infohash}&category=${category}`;
        axios_1.default.request({
            method: 'POST',
            url: `http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/setCategory`,
            data: payload,
            headers: {
                'Cookie': config_1.COOKIE,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).then(response => {
            logger_1.logger.info(`Successfully set category for ${infohash} to ${category}`);
            resolve();
        }).catch(error => {
            logger_1.logger.error(`Set category API failed with error code ${error.response.status}. Make sure the category exists!`);
            reject(error.response.status);
        });
    });
};
exports.setCategory = setCategory;
const addTorrent = (path, category) => {
    return new Promise((resolve, reject) => {
        let formData = new FormData();
        try {
            const torrentData = fs.readFileSync(path);
            formData.append("torrents", torrentData, 'dummy.torrent');
        }
        catch (error) {
            logger_1.logger.error(`Unable to read file ${path}`);
            reject();
        }
        if (category !== null) {
            logger_1.logger.info(`Setting category to ${category}`);
            formData.append('category', category);
        }
        axios_1.default.request({
            method: 'POST',
            url: `http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/add`,
            headers: Object.assign(Object.assign({ 'Cookie': config_1.COOKIE }, formData.getHeaders()), { 'Content-Length': formData.getLengthSync() //Because axios can't handle this. Wasted 2 hours trying to debug. Fuck.
             }),
            data: formData
        }).then(response => {
            logger_1.logger.info(`Successfully added to qBittorrent!`);
            resolve();
        }).catch(error => {
            logger_1.logger.error(`Add torrent API failed with error code ${error.response.status}`);
            reject();
        });
    });
};
exports.addTorrent = addTorrent;
const getTrackers = (infohash) => {
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
            logger_1.logger.error(`Get trackers API failed with error code ${error.response.status}`);
            reject(error);
        });
    });
};
exports.getTrackers = getTrackers;
const reannounce = (infohash) => {
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
            logger_1.logger.error(`Reannounce API failed with error code ${error.response.status}`);
            reject(error);
        });
    });
};
exports.reannounce = reannounce;
//# sourceMappingURL=api.js.map