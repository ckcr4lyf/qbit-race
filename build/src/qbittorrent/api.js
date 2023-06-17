import axios from 'axios';
import FormData from 'form-data';
export class QbittorrentApi {
    constructor(basePath, cookie) {
        this.basePath = basePath;
        this.cookie = cookie;
        this.client = axios.create({
            baseURL: basePath,
            headers: {
                'Cookie': cookie,
            }
        });
    }
    async getTorrents(hashes) {
        const params = {};
        if (Array.isArray(hashes)) {
            params.hashes = hashes.join('|');
        }
        try {
            const response = await this.client.get(ApiEndpoints.torrentsInfo, {
                params: params,
            });
            return response.data;
        }
        catch (e) {
            throw new Error(`Failed to get torrents from qBittorrent API. Error: ${e}`);
        }
    }
    // Just wraps getTorrents as a convenience method for single torrent
    async getTorrent(infohash) {
        const torrents = await this.getTorrents([infohash]);
        if (torrents.length === 0) {
            throw new Error(`Torrent not found! (Infohash = ${infohash})`);
        }
        return torrents[0];
    }
    async getTrackers(infohash) {
        try {
            const response = await this.client.get(ApiEndpoints.torrentTrackers, {
                params: {
                    hash: infohash,
                }
            });
            return response.data;
        }
        catch (e) {
            throw new Error(`Failed to get trackers from qBittorrent API for ${infohash}. Error: ${e}`);
        }
    }
    async addTags(torrents, tags) {
        if (torrents.length === 0) {
            return;
        }
        if (tags.length === 0) {
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
        }
        catch (e) {
            throw new Error(`Failed to add tags to torrent: ${e}`);
        }
    }
    async setCategory(infohash, category) {
        const payload = `hashes=${infohash}&category=${category}`;
        await this.client.post(ApiEndpoints.setCategory, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
    }
    async resumeTorrents(torrents) {
        try {
            await this.client.get(ApiEndpoints.resumeTorrents, {
                params: {
                    hashes: torrents.map(torrent => torrent.hash).join('|'),
                }
            });
        }
        catch (e) {
            throw new Error(`Failed to resume torrents. Error: ${e}`);
        }
    }
    async pauseTorrents(torrents) {
        if (torrents.length === 0) {
            return;
        }
        const payload = `hashes=${torrents.map(torrent => torrent.hash).join('|')}`;
        await this.client.post(ApiEndpoints.pauseTorrents, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
    }
    async deleteTorrentsWithFiles(torrents) {
        if (torrents.length === 0) {
            return;
        }
        await this.client.get(ApiEndpoints.deleteTorrents, {
            params: {
                hashes: torrents.map(torrent => torrent.hash).join('|'),
                deleteFiles: true,
            }
        });
    }
    async addTorrent(torrentData, category) {
        let formData = new FormData();
        formData.append("torrents", torrentData, 'dummy.torrent'); // The filename doesn't really matter
        if (category !== undefined) {
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
    async reannounce(infohash) {
        await this.client.get(ApiEndpoints.reannounce, {
            params: {
                hashes: infohash,
            }
        });
    }
    async getTransferInfo() {
        const response = await this.client.get(ApiEndpoints.transferInfo);
        return response.data;
    }
}
var ApiEndpoints;
(function (ApiEndpoints) {
    ApiEndpoints["login"] = "/api/v2/auth/login";
    ApiEndpoints["torrentsInfo"] = "/api/v2/torrents/info";
    ApiEndpoints["torrentTrackers"] = "/api/v2/torrents/trackers";
    ApiEndpoints["resumeTorrents"] = "/api/v2/torrents/resume";
    ApiEndpoints["addTags"] = "/api/v2/torrents/addTags";
    ApiEndpoints["setCategory"] = "/api/v2/torrents/setCategory";
    ApiEndpoints["pauseTorrents"] = "/api/v2/torrents/pause";
    ApiEndpoints["addTorrent"] = "/api/v2/torrents/add";
    ApiEndpoints["deleteTorrents"] = "/api/v2/torrents/delete";
    ApiEndpoints["reannounce"] = "/api/v2/torrents/reannounce";
    ApiEndpoints["transferInfo"] = "/api/v2/transfer/info";
})(ApiEndpoints || (ApiEndpoints = {}));
export const login = (qbittorrentSettings) => {
    return axios.post(`${qbittorrentSettings.url}${ApiEndpoints.login}`, {
        username: qbittorrentSettings.username,
        password: qbittorrentSettings.password
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });
};
//# sourceMappingURL=api.js.map