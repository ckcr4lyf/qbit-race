//Prepare message JSONs for different requirements
import { humanFileSize } from '../helpers/utilities.js';
import { DISCORD_SETTINGS, SETTINGS } from '../../settings.js';
import { QbittorrentTorrent } from '../qbittorrent/api.js';

const { botUsername, botAvatar } = SETTINGS.DISCORD_NOTIFICATIONS || { botUsername: 'qBittorrent', botAvatar: '' }


export const addMessage = (torrentName: string, trackers: string[], size: number, reannounceCount: number) => {

    const humanSize = humanFileSize(size, false, 2);
    const body = {
        content: `Added ${torrentName} (${humanSize})`,
        username: botUsername,
        avatar_url: botAvatar,
        embeds: [
            {
                title: torrentName,
                description: 'Added to qBittorrent',
                thumbnail: {
                    url: botAvatar
                },
                fields: [
                    {
                        name: trackers.length === 1 ? 'Tracker' : 'Trackers',
                        value: trackers.join('\n')
                    },
                    {
                        name: 'Size',
                        value: humanSize
                    },
                    {
                        name: 'Reannounce Count',
                        value: reannounceCount.toString()
                    }
                ]
            }
        ]   
    };

    return body;
}

export const completeMessage = (torrentName: string, trackers: string[], size: number, ratio: number) => {

    let trackersMessage = trackers.join('\n');
    if (trackersMessage === ''){
        trackersMessage = 'No trackers set!';
    }

    const humanSize = humanFileSize(size, false, 2);
    const body = {
        content: `Completed ${torrentName}! (Ratio: ${ratio.toFixed(2)})`,
        username: botUsername,
        avatar_url: botAvatar,
        embeds: [
            {
                title: torrentName,
                description: 'Completed download',
                thumbnail: {
                    url: botAvatar
                },
                fields: [
                    {
                        name: 'Ratio',
                        value: ratio.toFixed(2).toString()
                    },
                    {
                        name: trackers.length === 1 ? 'Tracker' : 'Trackers',
                        value: trackersMessage
                    },
                    {
                        name: 'Size',
                        value: humanSize
                    }
                ]
            }
        ]   
    };

    return body;
}

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

export const buildTorrentCompletedBody = (discordSettings: DISCORD_SETTINGS, torrent: QbittorrentTorrent): MessageBody => {
    const humanSize = humanFileSize(torrent.size, false, 2);

    let partialBody: PartialMesssageBody = {
        content: `Completed ${torrent.name}! (Ratio: ${torrent.ratio.toFixed(2)})`,
        embeds: [
            {
                title: torrent.name,
                description: 'Completed download',
                thumbnail: {
                    url: botAvatar
                },
                fields: [
                    {
                        name: 'Ratio',
                        value: torrent.ratio.toFixed(2).toString()
                    },
                    {
                        name: torrent.tags.split(',').length === 1 ? 'Tracker' : 'Trackers',
                        value: torrent.tags.split(',').join('\n'),
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
