"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reannounce = exports.getTrackers = exports.addTorrent = exports.getTorrents = void 0;
const axios_1 = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const config_1 = require("../config");
exports.getTorrents = () => {
    axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/info`, {
        headers: { 'Cookie': config_1.COOKIE }
    }).then(response => {
        console.log(response.status);
        console.log(response.data);
    }).catch(error => {
        console.log("RIP", error);
    });
};
exports.addTorrent = (path) => {
    return new Promise((resolve, reject) => {
        let formData = new FormData();
        const torrentData = fs.readFileSync(path);
        formData.append("torrents", torrentData, 'dummy.torrent');
        axios_1.default.request({
            method: 'POST',
            url: `http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/add`,
            headers: Object.assign(Object.assign({ 'Cookie': config_1.COOKIE }, formData.getHeaders()), { 'Content-Length': formData.getLengthSync() //Because axios can't handle this. Wasted 2 hours trying to debug. Fuck.
             }),
            data: formData
        }).then(response => {
            console.log(`[ADD TORRENT] Successfully added to qBittorrent!`);
            resolve();
            // console.log(response.status);
            // console.log(response.data);
        }).catch(error => {
            reject();
            console.log("RIP", error.response.status, error.response.data);
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
            reject(error);
            console.log("RIP", error);
        });
    });
};
exports.reannounce = (infohash) => {
    console.log(`In reannounce`);
    return new Promise((resolve, reject) => {
        axios_1.default.get(`http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}/api/v2/torrents/reannounce`, {
            params: {
                hashes: infohash
            },
            headers: {
                'Cookie': config_1.COOKIE
            }
        }).then(response => {
            console.log(response.status, response.data);
            resolve();
        }).catch(error => {
            reject(error);
        });
    });
};
//# sourceMappingURL=api.js.map