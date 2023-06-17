//Prepare message JSONs for different requirements
import { humanFileSize } from '../helpers/utilities.js';
import { QbittorrentTorrent } from '../qbittorrent/api.js';
import { DISCORD_SETTINGS } from '../utils/config.js';

type EmbedField = {
    name: string;
    value: string;
}

type DiscordEmbed = {
    title: string;
    description: string;
    thumbnail: {
        url: string;
    },
    fields: EmbedField[];
}

type PartialMesssageBody = {
    content: string;
    embeds: DiscordEmbed[];
}

type MessageBody = PartialMesssageBody & {
    username: string;
    avatar_url: string;
}

type TorrentAddedInfo = {
    name: string;
    trackers: string[];
    size: number;
    reannounceCount: number;
}

export const buildMessageBody = (discordSettings: DISCORD_SETTINGS, partialBody: PartialMesssageBody): MessageBody => {
    return {
        ...partialBody,
        username: discordSettings.botUsername,
        avatar_url: discordSettings.botAvatar,
    }
}

export const buildTorrentAddedBody = (discordSettings: DISCORD_SETTINGS, torrentAddedInfo: TorrentAddedInfo): MessageBody => {
    const humanSize = humanFileSize(torrentAddedInfo.size, false, 2);

    let partialBody: PartialMesssageBody =  {
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
    }

    return buildMessageBody(discordSettings, partialBody);
}

// TODO: generalize with above
export const buildRacingBody = (discordSettings: DISCORD_SETTINGS, torrentAddedInfo: TorrentAddedInfo): MessageBody => {
    const humanSize = humanFileSize(torrentAddedInfo.size, false, 2);

    let partialBody: PartialMesssageBody =  {
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
    }

    return buildMessageBody(discordSettings, partialBody);
}

export const buildTorrentCompletedBody = (discordSettings: DISCORD_SETTINGS, torrent: QbittorrentTorrent): MessageBody => {
    const humanSize = humanFileSize(torrent.size, false, 2);

    let partialBody: PartialMesssageBody = {
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
    }

    return buildMessageBody(discordSettings, partialBody);
}
