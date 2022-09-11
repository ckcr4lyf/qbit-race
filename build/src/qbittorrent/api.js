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
        const response = await this.client.get(ApiEndpoints.torrentsInfo, {
            params: params,
        });
        return response.data;
    }
    // Just wraps getTorrents as a convenience method for single torrent
    async getTorrent(infohash) {
        const torrents = await this.getTorrents([infohash]);
        return torrents[0];
    }
    async getTrackers(infohash) {
        const response = await this.client.get(ApiEndpoints.torrentTrackers, {
            params: {
                hash: infohash,
            }
        });
        return response.data;
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
        await this.client.post(ApiEndpoints.addTags, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
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
        await this.client.get(ApiEndpoints.resumeTorrents, {
            params: {
                hashes: torrents.map(torrent => torrent.hash).join('|'),
            }
        });
    }
    async pauseTorrents(torrents) {
        if (torrents.length === 0) {
            return;
        }
        await this.client.get(ApiEndpoints.pauseTorrents, {
            params: {
                hashes: torrents.map(torrent => torrent.hash).join('|')
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
})(ApiEndpoints || (ApiEndpoints = {}));
export const login = (qbittorrentSettings) => {
    return axios.get(`${qbittorrentSettings.url}${ApiEndpoints.login}`, {
        params: {
            username: qbittorrentSettings.username,
            password: qbittorrentSettings.password,
        }
    });
};
// TODO: Get rid of these guys
const basePath = '';
const COOKIE = '';
const logger = {};
export const getTransferInfo = () => {
    return axios.get(`${basePath}/api/v2/transfer/info`, {
        headers: {
            'Cookie': COOKIE
        }
    }).then(response => {
        return response.data;
    }).catch(err => {
        logger.error(`Get transferInfo failed with error code ${err.response.status}`);
        throw err;
    });
};
//# sourceMappingURL=api.js.map