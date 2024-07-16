export const defaultSettings = {
    REANNOUNCE_INTERVAL: 5000,
    REANNOUNCE_LIMIT: 30,
    PAUSE_RATIO: 1,
    PAUSE_SKIP_TAGS: ["tracker.linux.org", "some_other_tag"],
    PAUSE_SKIP_CATEGORIES: ["permaseeding", "some_other_category"],
    SKIP_RESUME: false,
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
};
//# sourceMappingURL=config.js.map