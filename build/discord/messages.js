"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeMessage = exports.addMessage = void 0;
//Prepare message JSONs for different requirements
const utilities_1 = require("../helpers/utilities");
const settings_1 = require("../../settings");
const { botUsername, botAvatar } = settings_1.SETTINGS.DISCORD_NOTIFICATIONS || { botUsername: 'qBittorrent', botAvatar: '' };
const addMessage = (torrentName, trackers, size, reannounceCount) => {
    const humanSize = utilities_1.humanFileSize(size, false, 2);
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
};
exports.addMessage = addMessage;
const completeMessage = (torrentName, trackers, size, ratio) => {
    let trackersMessage = trackers.join('\n');
    if (trackersMessage === '') {
        trackersMessage = 'No trackers set!';
    }
    const humanSize = utilities_1.humanFileSize(size, false, 2);
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
};
exports.completeMessage = completeMessage;
//# sourceMappingURL=messages.js.map