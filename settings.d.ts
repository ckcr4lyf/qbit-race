interface DISCORD_SETTINGS {
    enabled: boolean;
    botUsername: string;
    botAvatar: string;
}

export const SETTINGS: {
    REANNOUNCE_INTERVAL: number;
    REANNOUNCE_LIMIT: number;
    PAUSE_RATIO: number;
    PAUSE_SKIP_TAGS: string[];
    PAUSE_SKIP_CATEGORIES: string[];
    CONCURRENT_RACES: number;
    COUNT_STALLED_DOWNLOADS: boolean;
    DISCORD_NOTIFICATIONS: DISCORD_SETTINGS;
}