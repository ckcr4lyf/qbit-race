export type DISCORD_SETTINGS = {
    /**
     * Controls whether the webhook is enabled or not
     */
    enabled: boolean;
    /**
     * The URL of the discord webhook to send notifications to
     */
    webhook: string;
    /**
     * The username the webhook message will come from
     */
    botUsername: string;
    /**
     * The discord profile photo of the "webhook user"
     * Should be a URL path to an image
     */
    botAvatar: string;
}

export type QBITTORRENT_SETTINGS = {
    /**
     * The complete URL to the qBittorrent WEB UI. Should have the port
     * and url ending path if applicable.
     * 
     * @example http://localhost:8080
     * @example https://domain.com:1337/qbit
     * 
     */
    url: string;
    /**
     * Username for qBittorrent web ui
     * (default is `admin`)
     */
    username: string;
    /**
     * Password for qBittorrent web ui
     * (default is `adminadmin` - please change!)
     */
    password: string;
}

export type PROMETHEUS_SETTINGS = {
    /**
     * The ip to bind the metrics server to
     */
    ip: string,
    /**
     * The port to listen on
     */
    port: number,
}

export type Settings = {
    /**
     * Number of seconds to wait between reannounces, in milliseconds
     */
    REANNOUNCE_INTERVAL: number;
    /**
     * The number of times to attempt reannouncing
     */
    REANNOUNCE_LIMIT: number;
    /**
     * All torrents with ratio greater than or equal to this will
     * be paused when a new torrent is added for racing.
     * Set to -1 to disable pausing of torents
     */
    PAUSE_RATIO: number;
    /**
     * Torrents with these tags will be skipped from pause logic
     * when adding a new torrent for racing
     */
    PAUSE_SKIP_TAGS: string[];
    /**
     * Torrents matching any of these categories will be skipped
     * from pause logic when adding a new torrent for racing
     */
    PAUSE_SKIP_CATEGORIES: string[];
    /**
     * The maximum number of active "races". If these many races are
     * going on, then the download will be skipped
     * Set to -1 to ignore checking for ongoing races
     */
    CONCURRENT_RACES: number;
    /**
     * Whether stalled downloads should be counted as "downloading" (irrespective of age)
     * when deternining whether a torrent should be added for racing (by comparing against
     * CONCURRENT_RACES)
     */
    COUNT_STALLED_DOWNLOADS: boolean;
    DISCORD_NOTIFICATIONS: DISCORD_SETTINGS;
    QBITTORRENT_SETTINGS: QBITTORRENT_SETTINGS;
    PROMETHEUS_SETTINGS: PROMETHEUS_SETTINGS;
    /**
     * Set of category changes to perform on torrent completion
     */
    CATEGORY_FINISH_CHANGE: Record<string, string>;
}

/**
 * Extra options to be passed via CLI args
 */
export type Options = {
    /**
     * Whether the trackers should be added as tags to the torrent
     */
    trackerTags: boolean;
}

export const defaultSettings: Settings = {
    REANNOUNCE_INTERVAL: 5000,
    REANNOUNCE_LIMIT: 30,
    PAUSE_RATIO: 1,
    PAUSE_SKIP_TAGS: ["tracker.linux.org", "some_other_tag"],
    PAUSE_SKIP_CATEGORIES: ["permaseeding", "some_other_category"],
    CONCURRENT_RACES: 1,
    COUNT_STALLED_DOWNLOADS: false,
    QBITTORRENT_SETTINGS: {
       url: 'http://localhost:8080',
       username: 'admin',
       password: 'adminadmin',
    },
    PROMETHEUS_SETTINGS: {
        ip: '127.0.0.1',
        port: 9999,
    },
    DISCORD_NOTIFICATIONS: {
        enabled: false,
        webhook: '',
        botUsername: 'qBittorrent',
        botAvatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/New_qBittorrent_Logo.svg/600px-New_qBittorrent_Logo.svg.png'
    },
    CATEGORY_FINISH_CHANGE: {
        'OLD_CATEGORY': 'NEW_CATEORY'
    }
}