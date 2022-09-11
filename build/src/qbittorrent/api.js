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
export const getTorrentInfo = (infohash) => {
    return new Promise((resolve, reject) => {
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
    });
};
export const getTorrents = () => {
    return new Promise((resolve, reject) => {
        axios.get(`${basePath}/api/v2/torrents/info`, {
            headers: { 'Cookie': COOKIE }
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            logger.error(`Get torrents API failed with error code ${error.response.status}`);
            reject(error.response.status);
        });
    });
};
export const pauseTorrents = (torrents) => {
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
    });
};
export const resumeTorrents = (torrents) => {
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
    });
};
export const deleteTorrents = (torrents) => {
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
        });
    });
};
export const addTags = (torrents, tags) => {
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
};
export const setCategory = (infohash, category) => {
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
        });
    });
};
export const addTorrent = (torrentFile, category) => {
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
};
export const getTrackers = (infohash) => {
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
            logger.error(`Get trackers API failed with error code ${error.response.status}`);
            reject(error);
        });
    });
};
export const reannounce = (infohash) => {
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
            logger.error(`Reannounce API failed with error code ${error.response.status}`);
            reject(error);
        });
    });
};
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