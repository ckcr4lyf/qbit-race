#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig, makeConfigIfNotExist } from '../build/src/utils/configV2.js';
import { loginV2 } from '../build/src/qbittorrent/auth.js';
import { sendMessageV2 } from '../build/src/discord/api.js'
import { buildTorrentAddedBody } from '../build/src/discord/messages.js'
import { getLoggerV3 } from '../build/src/utils/logger.js'
import { tagErroredTorrents } from '../build/src/racing/tag.js'
import { postRaceResumeV2 } from '../build/src/racing/completed.js'
import { raceExisting } from '../build/src/racing/common.js'
import { startMetricsServer } from '../build/src/server/appFactory.js';
import { addTorrentToRace } from '../build/src/racing/add.js';

// This should take care of having a base config
makeConfigIfNotExist();
const config = loadConfig();
const program = new Command();

const logger = getLoggerV3();
logger.info(`Starting...`);

program.command('validate').description(`Validate that you've configured qbit-race correctly`).action(async () => {
    logger.info(`Going to login`);

    try {
        await loginV2(config.QBITTORRENT_SETTINGS);
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
        logger.error(`Validation failed! ${e}`);
        process.exit(1);
    }
})

program.command('tag-error').description(`Tag torrents for which the tracker is errored`).option('--dry-run', 'Just list torrents without actually tagging them').action(async (options) => {
    const api = await loginV2(config.QBITTORRENT_SETTINGS);
    await tagErroredTorrents(api, options.dryRun);
})

program.command('completed').description('Run post race procedure on complete of torrent').requiredOption('-i, --infohash <infohash>', 'The infohash of the torrent').action(async(options) => {
    if (options.infohash.length !== 40){
        logger.error(`Wrong length of infohash. Expected 40, received ${options.infohash.length}. (Provided infohash: ${options.infohash})`);
        process.exit(1);

    }
    const api = await loginV2(config.QBITTORRENT_SETTINGS);
    await postRaceResumeV2(api, config, options.infohash);
})

program.command('add').description('Add a new torrent').requiredOption('-p, --path <path>', 'The path to the .torrent file. Must be a single file, not a directory!').option('-c, --category <category>', 'Category to set in qBittorrent').option('--no-tracker-tags', 'Disable auto adding the trackers as tags on the torrent in qBittorrent').option('--extra-tags <tags>', 'Comma-separated list off extra tags to add. E.g. --extra-tags "linux,foss"').action(async(options) => {
    logger.debug(`Going to add torrent from ${options.path}, and set category ${options.category}`);
    const api = await loginV2(config.QBITTORRENT_SETTINGS);

    await addTorrentToRace(api, config, options.path, {
        trackerTags: options.trackerTags, // commander is extra smart, if we define with --no , it will default boolean to true and remove `no` from the name...
        extraTags: options.extraTags, // The raw csv string. We will split inside the function
    }, options.category);
})

program.command('race').description('Race an existing torrent').requiredOption('-i, --infohash <infohash>', 'The infohash of the torrent already in qBittorrent. Not case sensitive').action(async(options) => {
    logger.debug(`Going to race ${options.infohash}`);
    logger.info(`Going to login`);
    const api = await loginV2(config.QBITTORRENT_SETTINGS);

    try {
        await raceExisting(api, config, options.infohash);
    } catch (e){
        logger.error(`Failed to race ${options.infohash}. Error: ${e}. (${e.stack})`);
    }
})

program.command('metrics').description('Start a prometheus metrics server').action(async () => {
    const api = await loginV2(config.QBITTORRENT_SETTINGS);
    startMetricsServer(config, api);
})

program.parse();
