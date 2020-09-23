import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

import { QBIT_USERNAME, QBIT_HOST, QBIT_PASSWORD, QBIT_PORT, COOKIE } from '../config';

export const getTorrents = () => {
    axios.get(`http://${QBIT_HOST}:${QBIT_PORT}/api/v2/torrents/info`, {
        headers: {'Cookie': COOKIE}
    }).then(response => {
        console.log(response.status);
        console.log(response.data);
    }).catch(error => {
        console.log("RIP", error);
    })
}

export const addTorrent = (path: string) => {
    return new Promise((resolve, reject) => {
        let formData = new FormData();
        const torrentData = fs.readFileSync(path);
        formData.append("torrents", torrentData, 'dummy.torrent');
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
            console.log(`[ADD TORRENT] Successfully added to qBittorrent!`);
            resolve();
            // console.log(response.status);
            // console.log(response.data);
        }).catch(error => {
            reject();
            console.log("RIP", error.response.status, error.response.data);
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
            reject(error);
            console.log("RIP", error);
        })
    })
}

export const reannounce = (infohash: string) => {
    console.log(`In reannounce`);

    return new Promise((resolve, reject) => {
        axios.get(`http://${QBIT_HOST}:${QBIT_PORT}/api/v2/torrents/reannounce`, {
            params: {
                hashes: infohash
            },
            headers: {
                'Cookie': COOKIE
            }
        }).then(response => {
            console.log(response.status, response.data);
            resolve();
        }).catch(error => {
            reject(error);
        })
    })
}