//Prepare message JSONs for different requirements
import { humanFileSize } from '../helpers/utilities';
import { SETTINGS } from '../../settings';

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
                        value: trackers.join('\n')
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