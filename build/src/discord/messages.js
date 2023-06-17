//Prepare message JSONs for different requirements
import { humanFileSize } from '../helpers/utilities.js';
export const buildMessageBody = (discordSettings, partialBody) => {
    return {
        ...partialBody,
        username: discordSettings.botUsername,
        avatar_url: discordSettings.botAvatar,
    };
};
export const buildTorrentAddedBody = (discordSettings, torrentAddedInfo) => {
    const humanSize = humanFileSize(torrentAddedInfo.size, false, 2);
    let partialBody = {
        content: `Added ${torrentAddedInfo.name} (${humanSize})`,
        embeds: [
            {
                title: torrentAddedInfo.name,
                description: 'Added to qBittorrent',
                thumbnail: {
                    url: discordSettings.botAvatar,
                },
                fields: [
                    {
                        name: torrentAddedInfo.trackers.length === 1 ? 'Tracker' : 'Trackers',
                        value: torrentAddedInfo.trackers.join('\n')
                    },
                    {
                        name: 'Size',
                        value: humanSize
                    },
                    {
                        name: 'Reannounce Count',
                        value: torrentAddedInfo.reannounceCount.toString()
                    }
                ]
            }
        ]
    };
    return buildMessageBody(discordSettings, partialBody);
};
// TODO: generalize with above
export const buildRacingBody = (discordSettings, torrentAddedInfo) => {
    const humanSize = humanFileSize(torrentAddedInfo.size, false, 2);
    let partialBody = {
        content: `Added ${torrentAddedInfo.name} (${humanSize})`,
        embeds: [
            {
                title: torrentAddedInfo.name,
                description: 'Racing in qBittorrent',
                thumbnail: {
                    url: discordSettings.botAvatar,
                },
                fields: [
                    {
                        name: torrentAddedInfo.trackers.length === 1 ? 'Tracker' : 'Trackers',
                        value: torrentAddedInfo.trackers.join('\n')
                    },
                    {
                        name: 'Size',
                        value: humanSize
                    },
                    {
                        name: 'Reannounce Count',
                        value: torrentAddedInfo.reannounceCount.toString()
                    }
                ]
            }
        ]
    };
    return buildMessageBody(discordSettings, partialBody);
};
export const buildTorrentCompletedBody = (discordSettings, torrent) => {
    const humanSize = humanFileSize(torrent.size, false, 2);
    let partialBody = {
        content: `Completed ${torrent.name}! (Ratio: ${torrent.ratio.toFixed(2)})`,
        embeds: [
            {
                title: torrent.name,
                description: 'Completed download',
                thumbnail: {
                    url: discordSettings.botAvatar
                },
                fields: [
                    {
                        name: 'Ratio',
                        value: torrent.ratio.toFixed(2).toString()
                    },
                    {
                        name: torrent.tags.split(',').length === 1 ? 'Tracker' : 'Trackers',
                        value: torrent.tags.split(',').join('\n') || 'No trackers set as tags',
                    },
                    {
                        name: 'Size',
                        value: humanSize
                    }
                ]
            }
        ]
    };
    return buildMessageBody(discordSettings, partialBody);
};
//# sourceMappingURL=messages.js.map