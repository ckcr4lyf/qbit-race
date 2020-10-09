exports.SETTINGS = {
    REANNOUNCE_INTERVAL: 5000, //Time to wait between reannounces, milliseconds. 
    REANNOUNCE_LIMIT: 30, //How many times to try to reannounce
    PAUSE_RATIO: 1, //Seeding Torrents with ratio greater than or equal to this will be paused when a torrent is loaded for racing. Set to -1 to disable pause (worse performance)
    CONCURRENT_RACES: 1, //If these many races (downloads in qbit) are going on, then the incoming torrent will be skipped
    COUNT_STALLED_DOWNLOADS: false, //These are cases when the seeder abandons. Sets whether to count them while checking CONCURRENT_RACES. Afvisable to set to false, because if CONCURRENT_RACES is 1, and a seeder abandons, this will skip all future races even though box is idle
    DISCORD_NOTIFICATIONS: {
        enabled: false,
        botUsername: 'qBittorrent',
        botAvatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/New_qBittorrent_Logo.svg/600px-New_qBittorrent_Logo.svg.png'
    }
}