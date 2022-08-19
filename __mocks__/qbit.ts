import { QbittorrentApi } from '../src/qbittorrent/api.js'

export const newMockQbitApi = (): QbittorrentApi => {
    return {
        getTorrents: (): undefined => undefined,
        getTrackers: (): undefined => undefined,
    } as unknown as QbittorrentApi; // dont tell me what to do
}

export const getMockWorkingTrackers: any = () => {
    return [
        {
            status: 2,
        },
        {
            status: 2,
        },
        {
            status: 2,
        },
        {
            status: 2, // First 3 are DHT , PEX etc.
        },
    ]
}