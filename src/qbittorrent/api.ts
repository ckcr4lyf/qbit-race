import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

import { QBIT_HOST, QBIT_PORT, COOKIE, HTTP_SCHEME, URL_PATH } from '../config.js';
import { logger } from '../helpers/logger.js';
import { torrentFromApi, TransferInfo } from '../interfaces.js';

const basePath = `${HTTP_SCHEME}://${QBIT_HOST}:${QBIT_PORT}${URL_PATH}`

export const getTorrentInfo = (infohash: string): Promise<torrentFromApi> => {
    return new Promise((resolve: (value: torrentFromApi) => void, reject) => {
        axios.get(`${basePath}/api/v2/torrents/info`, {
            params: {
                hashes: infohash
            },
            headers: {'Cookie': COOKIE}
        }).then(response => {
            resolve(response.data[0]);
        }).catch(error => {
            logger.error(`Get torrent info API failed with error code ${error.response.status}`);
            reject(error.response.status);
        });
    })
}

export const getTorrents = (): Promise<torrentFromApi[]> => {
    return new Promise((resolve, reject) => {
        axios.get(`${basePath}/api/v2/torrents/info`, {
            headers: {'Cookie': COOKIE}
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            logger.error(`Get torrents API failed with error code ${error.response.status}`);
            reject(error.response.status);
        });
    })
}

export const pauseTorrents = (torrents: any[]): Promise<void> => {
    return new Promise((resolve, reject) => {

        if (torrents.length === 0){
            resolve();
            return;
        }

        const infohashes = torrents.map(torrent => torrent.hash);
        axios.get(`${basePath}/api/v2/torrents/pause`, {
            params: {
                hashes: infohashes.join('|')
            },
            headers: {'Cookie': COOKIE}
        }).then(response => {
            logger.info(`Successfully paused ${infohashes.length} torrents!`);
            resolve();
        }).catch(error => {
            logger.error(`Pause torrents API failed with error code ${error.response.status}`);
            reject();
        });
    })
}

export const resumeTorrents = (torrents: torrentFromApi[]): Promise<void> => {
    return new Promise((resolve, reject) => {

        if (torrents.length === 0){
            resolve();
            return;
        }

        const infohashes = torrents.map(torrent => torrent.hash);
        axios.get(`${basePath}/api/v2/torrents/resume`, {
            params: {
                hashes: infohashes.join('|')
            },
            headers: {'Cookie': COOKIE}
        }).then(response => {
            logger.info(`Successfully resumed ${infohashes.length} torrents!`);
            resolve();
        }).catch(error => {
            logger.error(`Resume torrents API failed with error code ${error.response.status}`);
            reject();
        });
    })
}

export const deleteTorrents = (torrents: any[]): Promise<void> => {
    return new Promise((resolve, reject) => {

        if (torrents.length === 0){
            resolve();
            return;
        }

        const infohashes = torrents.map(torrent => torrent.hash);
        axios.get(`${basePath}/api/v2/torrents/delete`, {
            params: {
                hashes: infohashes.join('|'),
                deleteFiles: true
            },
            headers: {'Cookie': COOKIE}
        }).then(response => {
            logger.info(`Successfully deleted ${torrents.length} torrents.`);
            resolve();
        }).catch(error => {
            logger.error(`Delete torrents API failed with error code ${error.response.status}`);
            reject();
        })
    })
}

export const addTags = (torrents: any[], tags: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {

        if (torrents.length === 0){
            resolve();
            return;
        }

        if (tags.length === 0){
            resolve();
            return;
        }

        const infohashes = torrents.map(torrent => torrent.hash);
        let payload = `hashes=${infohashes.join('|')}&tags=${tags.join(',')}`;

        axios.request({
            method: 'POST',
            url: `${basePath}/api/v2/torrents/addTags`, 
            data: payload,
            headers: {
                'Cookie': COOKIE,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(response => {
            logger.info(`Successfully added ${tags.length} tags to ${torrents.length} torrents.`);
            resolve();
        }).catch(error => {
            logger.error(`Add tags API failed with error code ${error.response.status}`);
        });
    });
}

export const setCategory = (infohash: string, category: string): Promise<void> => {
    return new Promise((resolve, reject) => {

        let payload = `hashes=${infohash}&category=${category}`;
        axios.request({
            method: 'POST',
            url: `${basePath}/api/v2/torrents/setCategory`,
            data: payload,
            headers: {
                'Cookie': COOKIE,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).then(response => {
            logger.info(`Successfully set category for ${infohash} to ${category}`);
            resolve();
        }).catch(error => {
            logger.error(`Set category API failed with error code ${error.response.status}. Make sure the category exists!`);
            reject(error.response.status);
        })
    })
}

export const addTorrent = (torrentFile: Buffer, category?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        
        let formData = new FormData();
        formData.append("torrents", torrentFile, 'dummy.torrent');
            
        if (category !== null){
            logger.info(`Setting category to ${category}`);
            formData.append('category', category);
        }

        axios.request({
            method: 'POST',
            url: `${basePath}/api/v2/torrents/add`,
            headers: {
                'Cookie': COOKIE,
                ...formData.getHeaders(),
                'Content-Length': formData.getLengthSync() //Because axios can't handle this. Wasted 2 hours trying to debug. Fuck.
            },
            data: formData
        }).then(response => {
            logger.info(`Successfully added to qBittorrent!`);
            resolve();
        }).catch(error => {
            logger.error(`Add torrent API failed with error code ${error.response.status}`);
            reject();
        });
    });
}

export const getTrackers = (infohash: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        axios.get(`${basePath}/api/v2/torrents/trackers`, {
            params: {
                hash: infohash
            },
            headers: {
                'Cookie': COOKIE
            }
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            logger.error(`Get trackers API failed with error code ${error.response.status}`)
            reject(error);
        })
    })
}

export const reannounce = (infohash: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        axios.get(`${basePath}/api/v2/torrents/reannounce`, {
            params: {
                hashes: infohash
            },
            headers: {
                'Cookie': COOKIE
            }
        }).then(response => {
            resolve();
        }).catch(error => {
            logger.error(`Reannounce API failed with error code ${error.response.status}`)
            reject(error);
        })
    })
}

export const getTransferInfo = (): Promise<TransferInfo> => {
    return axios.get(`${basePath}/api/v2/transfer/info`, {
        headers: {
            'Cookie': COOKIE
        }
    }).then(response => {
        return response.data;
    }).catch(err => {
        logger.error(`Get transferInfo failed with error code ${err.response.status}`);
        throw err;
    })
}