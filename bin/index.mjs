#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig, makeConfigIfNotExist } from '../build/utils/directory.js';
import { loginV2 } from '../build/qbittorrent/auth.js';
import { sendMessageV2 } from '../build/discord/api.js'
import { buildTorrentAddedBody } from '../build/discord/messages.js'
import { getLoggerV3 } from '../build/utils/logger.js'
import { tagErroredTorrents } from '../build/racing/tag.js'

const logger = getLoggerV3();
logger.info(`Starting...`);

// This should take care of having a base config
makeConfigIfNotExist();
const config = loadConfig();

// If credz are wrong, this will throw
const api = await loginV2(config.QBITTORRENT_SETTINGS);

const program = new Command();

program.command('validate').description(`Validate that you've configured qbit-race correctly`).action(async () => {
    logger.info(`Going to login`);

    try {
        // Check discord if applicable
        if (config.DISCORD_NOTIFICATIONS.enabled === true){
            await sendMessageV2(config.DISCORD_NOTIFICATIONS.webhook, buildTorrentAddedBody(config.DISCORD_NOTIFICATIONS, {
                name: '[qbit-race test] Arch Linux',
                trackers: ['archlinux.org', 'linux.org'],
                size: 1024 * 1024 * 1024 * 3.412,
                reannounceCount: 1,
            }))
        } else {
            logger.info(`Skipping discord validation as it is not enabled`);
        }

        logger.info(`Succesfully validated!`);
    } catch (e){
        logger.error(`Validation failed!`);
        process.exit(1);
    }
})

program.command('tag-error').description(`Tag torrents for which the tracker is errored`).option('--dry-run', 'Just list torrents without actually tagging them').action(async (options) => {
    await tagErroredTorrents(api, options.dryRun);
})

program.parse();
