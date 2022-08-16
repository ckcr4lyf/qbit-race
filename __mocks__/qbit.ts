import { QbittorrentApi } from '../src/qbittorrent/api.js'

export const newMockQbitApi = (): QbittorrentApi => {
    return {
        getTorrents: () => undefined,
        getTrackers: () => undefined,
    } as unknown as QbittorrentApi; // dont tell me what to do
}