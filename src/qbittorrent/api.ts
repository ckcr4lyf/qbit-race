import axios, { AxiosInstance, AxiosResponse } from 'axios';
import FormData from 'form-data';

import { torrentFromApi, TorrentState, TransferInfo } from '../interfaces.js';
import { QBITTORRENT_SETTINGS, Settings } from '../utils/config.js';
import { getLoggerV3 } from '../utils/logger.js';


export class QbittorrentApi {

    private client: AxiosInstance;
    private version: string;

    constructor(public basePath: string, public cookie: string) {

        this.client = axios.create({
            baseURL: basePath,
            headers: {
                'Cookie': cookie,
            }
        });

        this.version = 'v4'; // default to v4
    }
    
    async getAndSetVersion(): Promise<string> {
        try {
            const response = await this.client.get(ApiEndpoints.version);

            console.log(response.data);
            this.version = response.data;
            return response.data;
        } catch (e){
            throw new Error(`Failed to get qBittorrent version. Error: ${e}`);
        }
    }

    async getTorrents(hashes?: string[]): Promise<QbittorrentTorrent[]> {
        const params: Record<string, string> = {};

        if (Array.isArray(hashes)){
            params.hashes = hashes.join('|')
        }

        try {
            const response = await this.client.get(ApiEndpoints.torrentsInfo, {
                params: params,
            });
    
            return response.data;
        } catch (e){
            throw new Error(`Failed to get torrents from qBittorrent API. Error: ${e}`);
        }        
    }

    // Just wraps getTorrents as a convenience method for single torrent
    async getTorrent(infohash: string): Promise<QbittorrentTorrent> {
        const torrents = await this.getTorrents([infohash]);

        if (torrents.length === 0){
            throw new Error(`Torrent not found! (Infohash = ${infohash})`);
        }
        
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

        try {
            await this.client.post(ApiEndpoints.addTags, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
        } catch (e){
            throw new Error(`Failed to add tags to torrent: ${e}`);
        }
        
    }

    async setCategory(infohash: string, category: string){
        const payload = `hashes=${infohash}&category=${category}`;
        
        await this.client.post(ApiEndpoints.setCategory, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
    }

    async resumeTorrents(torrents: ApiCompatibleTorrent[]){
        const infohashes = torrents.map(torrent => torrent.hash);
        const endpoint = this.version >= 'v5' ? ApiEndpoints.resumeTorrentsNew : ApiEndpoints.resumeTorrents;
        const payload = `hashes=${infohashes.join('|')}`;

        try {
            await this.client.post(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
        } catch (e){
            throw new Error(`Failed to resume torrents. Error: ${e}`);
        }
    }
    
    async pauseTorrents(torrents: QbittorrentTorrent[]){
        if (torrents.length === 0){
            return;
        }

        const endpoint = this.version >= 'v5' ? ApiEndpoints.pauseTorrentsNew : ApiEndpoints.pauseTorrents;
        const payload = `hashes=${torrents.map(torrent => torrent.hash).join('|')}`

        await this.client.post(endpoint, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
    }
    async deleteTorrentsWithFiles(torrents: ApiCompatibleTorrent[]){
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

    async reannounce(infohash: string){
        const payload = `hashes=${infohash}`;
        
        try {
            await this.client.post(ApiEndpoints.reannounce, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
        } catch (e){
            throw new Error(`Failed to reannounce! Error: ${e}`);
        }
    }

    async getTransferInfo(): Promise<TransferInfo>{
        const response = await this.client.get(ApiEndpoints.transferInfo);
        return response.data;
    }
}

enum ApiEndpoints {
    login = '/api/v2/auth/login',
    torrentsInfo = '/api/v2/torrents/info',
    torrentTrackers = '/api/v2/torrents/trackers',
    resumeTorrents = '/api/v2/torrents/resume',
    resumeTorrentsNew = '/api/v2/torrents/start',
    addTags = '/api/v2/torrents/addTags',
    setCategory = '/api/v2/torrents/setCategory',
    pauseTorrents = '/api/v2/torrents/pause',
    pauseTorrentsNew = '/api/v2/torrents/stop',
    addTorrent = '/api/v2/torrents/add',
    deleteTorrents = '/api/v2/torrents/delete',
    reannounce = '/api/v2/torrents/reannounce',
    transferInfo = '/api/v2/transfer/info',
    version = '/api/v2/app/version',
}

export const login = (qbittorrentSettings: QBITTORRENT_SETTINGS): Promise<AxiosResponse> => {
    return axios.post(`${qbittorrentSettings.url}${ApiEndpoints.login}`, {
        username: qbittorrentSettings.username,
        password: qbittorrentSettings.password
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });
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