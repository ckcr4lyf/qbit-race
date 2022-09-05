import axios, { AxiosInstance, AxiosResponse } from 'axios';
import FormData from 'form-data';

import { QBIT_HOST, QBIT_PORT, COOKIE, HTTP_SCHEME, URL_PATH } from '../config.js';
import { logger } from '../helpers/logger.js';
import { torrentFromApi, TorrentState, TransferInfo } from '../interfaces.js';
import { QBITTORRENT_SETTINGS, Settings } from '../utils/config.js';

const basePath = `${HTTP_SCHEME}://${QBIT_HOST}:${QBIT_PORT}${URL_PATH}`

export class QbittorrentApi {

    private client: AxiosInstance;

    constructor(public basePath: string, public cookie: string) {

        this.client = axios.create({
            baseURL: basePath,
            headers: {
                'Cookie': cookie,
            }
        });

    }

    async getTorrents(hashes?: string[]): Promise<QbittorrentTorrent[]> {
        const params: Record<string, string> = {};

        if (Array.isArray(hashes)){
            params.hashes = hashes.join('|')
        }

        const response = await this.client.get(ApiEndpoints.torrentsInfo, {
            params: params,
        });

        return response.data;
    }

    // Just wraps getTorrents as a convenience method for single torrent
    async getTorrent(infohash: string): Promise<QbittorrentTorrent> {
        const torrents = await this.getTorrents([infohash]);
        return torrents[0];
    }

    async getTrackers(infohash: string): Promise<QbittorrentTracker[]> {
        const response = await this.client.get(ApiEndpoints.torrentTrackers, {
            params: {
                hash: infohash,
            }
        });

        return response.data;
    }

    async addTags(torrents: ApiCompatibleTorrent[], tags: string[]){
        if (torrents.length === 0){
            return;
        }

        if (tags.length === 0){
            return;
        }

        const infohashes = torrents.map(torrent => torrent.hash);
        const payload = `hashes=${infohashes.join('|')}&tags=${tags.join(',')}`;

        await this.client.post(ApiEndpoints.addTags, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
    }

    async setCategory(infohash: string, category: string){
        const payload = `hashes=${infohash}&category=${category}`;
        
        await this.client.post(ApiEndpoints.setCategory, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
    }

    async resumeTorrents(torrents: QbittorrentTorrent[]){
        await this.client.get(ApiEndpoints.resumeTorrents, {
            params: {
                hashes: torrents.map(torrent => torrent.hash).join('|'),
            }
        });
    }
    
    async pauseTorrents(torrents: QbittorrentTorrent[]){
        if (torrents.length === 0){
            return;
        }

        await this.client.get(ApiEndpoints.pauseTorrents, {
            params: {
                hashes: torrents.map(torrent => torrent.hash).join('|')
            }
        });
    }
    async deleteTorrentsWithFiles(torrents: QbittorrentTorrent[]){
        if (torrents.length === 0){
            return;
        }

        await this.client.get(ApiEndpoints.deleteTorrents, {
            params: {
                hashes: torrents.map(torrent => torrent.hash).join('|'),
                deleteFiles: true,
            }
        });
    }

    async addTorrent(torrentData: Buffer, category?: string){

        let formData = new FormData();
        formData.append("torrents", torrentData, 'dummy.torrent'); // The filename doesn't really matter

        if (category !== undefined){
            formData.append('category', category);
        }

        await this.client.post(ApiEndpoints.addTorrent, formData, {
            headers: {
                ...formData.getHeaders(),
                //Because axios can't handle this. Wasted 2 hours trying to debug. Fuck.
                'Content-Length': formData.getLengthSync(),
            }
        });
    }
}

enum ApiEndpoints {
    login = '/api/v2/auth/login',
    torrentsInfo = '/api/v2/torrents/info',
    torrentTrackers = '/api/v2/torrents/trackers',
    resumeTorrents = '/api/v2/torrents/resume',
    addTags = '/api/v2/torrents/addTags',
    setCategory = '/api/v2/torrents/setCategory',
    pauseTorrents = '/api/v2/torrents/pause',
    addTorrent = '/api/v2/torrents/add',
    deleteTorrents = '/api/v2/torrents/delete',
}

export const login = (qbittorrentSettings: QBITTORRENT_SETTINGS): Promise<AxiosResponse> => {
    return axios.get(`${qbittorrentSettings.url}${ApiEndpoints.login}`, {
        params: {
            username: qbittorrentSettings.username,
            password: qbittorrentSettings.password,
        }
    });
}

export const getTorrentInfo = (infohash: string): Promise<torrentFromApi> => {
    return new Promise((resolve: (value: torrentFromApi) => void, reject) => {
        axios.get(`${basePath}/api/v2/torrents/info`, {
            params: {
                hashes: infohash
            },
            headers: { 'Cookie': COOKIE }
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
            headers: { 'Cookie': COOKIE }
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

        if (torrents.length === 0) {
            resolve();
            return;
        }

        const infohashes = torrents.map(torrent => torrent.hash);
        axios.get(`${basePath}/api/v2/torrents/pause`, {
            params: {
                hashes: infohashes.join('|')
            },
            headers: { 'Cookie': COOKIE }
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

        if (torrents.length === 0) {
            resolve();
            return;
        }

        const infohashes = torrents.map(torrent => torrent.hash);
        axios.get(`${basePath}/api/v2/torrents/resume`, {
            params: {
                hashes: infohashes.join('|')
            },
            headers: { 'Cookie': COOKIE }
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

        if (torrents.length === 0) {
            resolve();
            return;
        }

        const infohashes = torrents.map(torrent => torrent.hash);
        axios.get(`${basePath}/api/v2/torrents/delete`, {
            params: {
                hashes: infohashes.join('|'),
                deleteFiles: true
            },
            headers: { 'Cookie': COOKIE }
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

        if (category !== null) {
            logger.info(`Setting category to ${category}`);
            formData.append('category', category);
        }

        axios.request({
            method: 'POST',
            url: `${basePath}/api/v2/torrents/add`,
            headers: {
                'Cookie': COOKIE,
                ...formData.getHeaders(),
                'Content-Length': formData.getLengthSync() 
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

// We just need the hash for some of the API calls
export type ApiCompatibleTorrent = {
    hash: string;
}

export type QbittorrentTorrent = {
    name: string;
    hash: string;
    state: TorrentState;
    added_on: number; //Unix timestamp
    ratio: number;
    category: string; // "" or single category
    tags: string; // "" or CSV of multiple tags
    size: number;
}

export type QbittorrentTracker = {
    status: number;
    url: string;
}