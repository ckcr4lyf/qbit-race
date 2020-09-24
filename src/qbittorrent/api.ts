import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

import { QBIT_HOST, QBIT_PORT, COOKIE } from '../config';
import { feedLogger  } from '../helpers/logger';

export const getTorrents = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        axios.get(`http://${QBIT_HOST}:${QBIT_PORT}/api/v2/torrents/info`, {
            headers: {'Cookie': COOKIE}
        }).then(response => {
            // console.log(response.status);
            // console.log(response.data);
            resolve(response.data);
        }).catch(error => {
            feedLogger.log(`GET TORRENTS`, `Failed with error code ${error.response.status}`);
            reject(error.response.status);
        });
    })
}

export const pauseTorrents = (torrents: any[]) => {
    return new Promise((resolve, reject) => {

        if (torrents.length === 0){
            resolve();
            return;
        }

        const infohashes = torrents.map(torrent => torrent.hash);
        axios.get(`http://${QBIT_HOST}:${QBIT_PORT}/api/v2/torrents/pause`, {
            params: {
                hashes: infohashes.join('|')
            },
            headers: {'Cookie': COOKIE}
        }).then(response => {
            feedLogger.log('PAUSE TORRENTS', `Successfully paused ${infohashes.length} torrents!`);
            resolve();
        }).catch(error => {
            feedLogger.log('PAUSE TORRENTS', `Failed with error code ${error.response.status}`);
            reject();
        });
    })
}

export const addTorrent = (path: string) => {
    return new Promise((resolve, reject) => {
        let formData = new FormData();

        try {
            const torrentData = fs.readFileSync(path);
            formData.append("torrents", torrentData, 'dummy.torrent');
        } catch (error) {
            feedLogger.log('ADD TORRENT', `Unable to read file ${path}`);
            reject();
        }

        axios.request({
            method: 'POST',
            url: `http://${QBIT_HOST}:${QBIT_PORT}/api/v2/torrents/add`,
            headers: {
                'Cookie': COOKIE,
                ...formData.getHeaders(),
                'Content-Length': formData.getLengthSync() //Because axios can't handle this. Wasted 2 hours trying to debug. Fuck.
            },
            data: formData
        }).then(response => {
            feedLogger.log(`ADD TORRENT`, `Successfully added to qBittorrent!`);
            resolve();
        }).catch(error => {
            feedLogger.log("ADD TORRENT", `Failed with error code ${error.response.status}`);
            reject();
        });
    });
}

export const getTrackers = (infohash: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        axios.get(`http://${QBIT_HOST}:${QBIT_PORT}/api/v2/torrents/trackers`, {
            params: {
                hash: infohash
            },
            headers: {
                'Cookie': COOKIE
            }
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            feedLogger.log(`GET TRACKERS`, `Failed with error code ${error.response.status}`)
            reject(error);
        })
    })
}

export const reannounce = (infohash: string) => {
    return new Promise((resolve, reject) => {
        axios.get(`http://${QBIT_HOST}:${QBIT_PORT}/api/v2/torrents/reannounce`, {
            params: {
                hashes: infohash
            },
            headers: {
                'Cookie': COOKIE
            }
        }).then(response => {
            resolve();
        }).catch(error => {
            feedLogger.log(`REANNOUNCE`, `Failed with error code ${error.response.status}`)
            reject(error);
        })
    })
}