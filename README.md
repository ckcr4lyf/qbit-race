# qBittorrent Racing

`qbit-race` is a set of tools to help racing torrents on certain trackers. Some features are:

* Reannounce to tracker
* Automatically tag torrents with trackers
* Discord notifications on addition (w/ size, trackers)
* Discord notifications on completion (w/ ratio)
* Configuring the number of simultaneous races
* Pause seeding torrents when a new race is about to begin
* Skip torrents with certain tags / category from being paused prior to a race

This repository is still in beta. There might be bugs. Feel free to open an issue if you encounter one. 
You may also open an issue to request a feature, but please mark it with the prefix `[FEATURE REQUEST]`

**I would recommend you to use Node.JS latest LTS release, currently v16.14.0 and qBittorrent should be v4.2.x+**

## Thanks

<center>

[<img src="https://user-images.githubusercontent.com/6680615/88460516-56eac500-cecf-11ea-8552-584eaaac5297.png" width="300">](https://clients.walkerservers.com/)

Massive Thanks to <a href="https://walkerservers.com/">WalkerServers</a> for sponsoring this project. Check them out for affordable, high performance dedicated servers!
</center>

## Index

- [qBittorrent Racing](#qbittorrent-racing)
  - [Thanks](#thanks)
  - [Index](#index)
  - [Node requirement](#node-requirement)
    - [Important!](#important)
  - [Repo Setup](#repo-setup)
  - [Updating](#updating)
  - [Additional Settings](#additional-settings)
    - [Backup Settings](#backup-settings)
  - [AutoDL setup (Basic)](#autodl-setup-basic)
  - [AutoDL setup (Advanced)](#autodl-setup-advanced)
    - [Torrent Category](#torrent-category)
    - [Change Category on torrent completion](#change-category-on-torrent-completion)
  - [Autobrr Setup](#autobrr-setup-beta)
  - [qBittorrent post race setup](#qbittorrent-post-race-setup)
  - [Other Scripts](#other-scripts)
    - [Tag Errored Torrents](#tag-errored-torrents)
  - [Prometheus Exporter](#prometheus-exporter)
    - [Metrics server setup](#metrics-server-setup)
    - [Example PromQL queries](#example-promql-queries)

## Node requirement
This project needs Node.js v16+ (LTS recommended)
### Important! 
If you have installed Node.js with nvm, you will need to symlink it to your `bin` directory. Usually local bin will do, otherwise you may need to symlink it to `/usr/bin`

You can get the correct command to symlink nvm's node by running these commands (The following commands print the symlink to execute, but doesn't actually run them). 

For shared seedboxes:
```sh
echo "ln -s $(which node) ${HOME}/node"
```

or, for deciated seedboxes: (this might need a sudo)
```sh
echo "ln -s $(which node) /usr/bin/node"
```

## Repo Setup

Please download / install from [one of the releases!](https://github.com/ckcr4lyf/qbit-race/releases) The master branch is the bleeding edge version, and may include breaking changes. You have been warned.

First, you need to download the release, install some dependencies, and setup your enivronment variables file. 
You may run the following commands:

```sh
mkdir -p ~/scripts
cd ~/scripts
wget https://github.com/ckcr4lyf/qbit-race/archive/refs/tags/v1.1.0.tar.gz -O qbit-race.tar.gz
tar -xzf qbit-race.tar.gz
mv qbit-race-1.1.0 qbit-race
cd qbit-race
npm install
cp sample.env .env
cp sample.settings.js settings.js
```

Now open `.env` in an editor like nano or such, and change the values as per your setup. `QBIT_PORT` is the port the Web UI is listening on, NOT the port for incoming BitTorrent connections. `DISCORD_WEBHOOK` is optional, you should replace it with your chanell's webhook URL if you enable Discord noticiations in `settings.js` (more info below)

Once you think you've done it correctly, Validate it by running

```
npm run validate
```

If all went well, you'll see something like

```
2020-09-27T12:40:10.541Z [CONFIG] - Loaded .env
2020-09-27T12:40:10.644Z [CONFIG] - Updated COOKIE!
2020-09-27T12:40:10.656Z [AUTH] - Login completed in 0.07 seconds.
2020-09-27T12:40:10.656Z [TEST] - SUCCESS!
```

## Updating

You may run `git pull` in the parent directory to automatically pull updates. If new settings are introduced, you will need to check `sample.settings.js` and manually add them to your `settings.js`.

It is advised to backup your `settings.js` *just in case*.

## Additional Settings

There are additional parameters you can tweak in `settings.js`. These settings can be changed anytime by modifying this file, does not need a restart of qBittorrent or AutoDL. Here is a short explanation:

|Parameter|Default|Description|
|---------|-------|-----------|
|`REANNOUNCE_INTERVAL`|`5000`|milliseconds to wait before sending reannounce requests|
|`REANNOUNCE_LIMIT`|`30`|Number of times to reannounce to the tracker before "giving up" (sometimes a torrent may be announced but then deleted by moderation)|
|`PAUSE_RATIO`|`1`|When a new torrent is added, all seeding torrents above this ratio are paused. `-1` will not pause any torrents, this may lead to worse performance|
|`PAUSE_SKIP_TAGS`|`["tracker.linux.org", "some_other_tag"]`|Prevent pausing of torrents before a race, if any of the tags match. This parameter is useful for skipping certain trackers where you may want to maintain seedtime|
|`PAUSE_SKIP_CATEGORIES`|`["permaseeding", "some_other_category"]`|Prevent pausing of torrents before a race, if the category matches any in this list. Useful if you setup autoDL with some filters with the category option, and want to skip them|
|`CONCURRENT_RACES`|`1`|How many torrents can be "raced" at once. If autodl grabs a torrent, but these many races are already in progress, the torrent will be silently skipped. While less parallel races give better performance, if you want to download everything autoDL grabs, set this to `-1`|
|`COUNT_STALLED_DOWNLOADS`|`false`|If a seeder abandons the torrent midway, the download may be stalled. This option controlls whether such torrents should be counted when checking for `CONCURRENT_RACES`. It is advisable to keep this as false|
|`DISCORD_NOTIFICATIONS`|`object`|See below for descripton|
`CATEGORY_FINISH_CHANGE`|`object`|Check [this section](#change-category-on-torrent-completion) for details|

<br><br>
If you would like to receive discord notifications, so you can enable this option. **REMEMBER TO SET YOUR WEBHOOK URL IN THE .env FILE!**. The description of the options is as follows:

|Parameter|Default|Description|
|---------|-------|-----------|
|`enabled`|`false`|Controls whether notifications are sent or not. Set to `true` to enable discord notifications|
|`botUsername`|`qBittorrent`|The username of the Discord "account" that sends the notification|
|`botAvatar`|(qBittorrent logo)|The picture of the Discord "account" that sends notification, and thumbnail of the embed|

If you enable discord notifications, and set the webhook URL in `.env`, you can run `npm run validate` again and it should send you a message. The output should look like:
```
2020-09-27T13:32:33.337Z [CONFIG] - Loaded .env
2020-09-27T13:32:33.454Z [CONFIG] - Updated COOKIE!
2020-09-27T13:32:33.492Z [AUTH] - Login completed in 0.10 seconds.
2020-09-27T13:32:33.680Z [DISCORD] - Message sent successfully!
2020-09-27T13:32:33.680Z [TEST] - SUCCESS!
```

### Backup Settings

You can backup your settings easily by running `npm run backup`, useful if you plan to update just in case.

The file will be saved as `currenttimestamp_settings.js` in the path `~/.backup/qbit-race/`

## AutoDL setup (Basic)

To get the path to the script which will feed qBittorrent, run the following commands:
```sh
cd ~/scripts/qbit-race/bin
echo "$(pwd)/autodl_feed.mjs"
```

You will see a line like
```
/home/username/scripts/qbit-race/bin/autodl_feed.mjs
```

This is the path to the script. Now in AutoDL, change the Action for your filter (or Global action) to:
1. Choose .torrent action - `Run Program`
2. Comamnd - `/home/username/scripts/qbit-race/bin/autodl_feed.mjs`
3. Arguments - `"$(TorrentPathName)"`

**NOTE: THIS IS DIFFERENT THAN PREVIOUS VERSION WHICH NEEDED 4 ARGUMENTS!!!**

Click OK, and that should be it!

Now, when AutoDL geta a torrent, it will pass it to the script which will feed it to qBittorrent!

You can view the logs under `~/scripts/qbit-race/logs` to try and debug.

## AutoDL setup (Advanced)

These are additional parameters you can specify in autoDL for additional functionality

### Torrent Category

In the autoDL arguments field, you may specify a category (per filter, or global) by adding to the end of arguments `--category "the category name"`

For instance, a filter for Arch Linux ISOs could have the arguments:
```
`"$(InfoHash)" "$(InfoName)" "$(Tracker)" "$(TorrentPathName)" --category "never open"`
```

Which would set the category of all torrents that match said filter to "never open". If the category doesn't exist it will be created automatically. 

Protip: qBittorrent has a feature that allows you to configure download paths by category. This might be useful to consolidate your downloads.`

### Change Category on torrent completion

Often it may be desirable to change the category of the torrent on completion, often when using with Sonarr / Radarr etc. You can add as many rules as you would like (of course, a single torrent is limited to a single cateogry still, by qbittorrent itself).

To do so, there are two requirements:
1. The torrent must be added with a category set
2. The category *to be changed to* must already exist

Then, in `settings.js`, you can add a line to the `CATEGORY_FINISH_CHANGE` object, of the form:

```
'THE_CATEGORY_FROM_AUTODL': 'THE_CATEGORY_AFTER_COMPLETION'
```

For instance, if you add it as "DOWNLOADING_LINUX", and want to change to "SEEDING_LINUX", you can set it up as:
```
CATEGORY_FINISH_CHANGE: {
     'DOWNLOADING_LINUX': 'SEEDING_LINUX',
     'ANOTHER_ONE': 'YET_ANOTHER_ONE'
 }
```

## autobrr setup (BETA)

It should work with [autobrr](https://github.com/autobrr/autobrr) as well, for the arguments in autobrr, just put `{{ .TorrentPathName }}` , and the command to execute same as that for AutoDL (path to `autodl_feed.mjs`). Advanced instructions for category etc. are similar.

## qBittorrent post race setup

After the race, the post race script will resume the torrents (if nothing else is downloading), and also send you a discord notification with the ratio (if you have enabled it).

To get the path to the post race script, run the following commands:
```sh
cd ~/scripts/qbit-race/bin
echo "$(pwd)/post_race.mjs"
```

You will see a line like
```
/home/username/scripts/qbit-race/bin/post_race.mjs
```

This is the path to the script. Now open qBittorrent, and in that open settings. At the bottom of "Downloads", check "Run external program on torrent completion". 
In the textbox, enter that path to the script followed by `"%I" "%N" "%T"`.

So the final entry would look like
```
/home/username/scripts/qbit-race/bin/post_race.js "%I" "%N" "%T"
```


## Other Scripts

### Tag Errored Torrents

Sometimes torrents may be deleted from the tracker, or just an error in general. qBittorrent provides no easy way of sorting by these errors (Usually tracker responds with an error message).

To tag all such torrents as `error`, from the root folder (`~/qbit-race`), run:
```
npm run tag_unreg
```

This will tag all torrents which do not have ANY working tracker.


## Prometheus Exporter

`qbit-race` now also features a prometheus exporter, which is a lightweight http server (based on fastify) which exports a few stats in a prometheus friendly format.

The stats exposed are: 

* Download this session (bytes)
* Download rate (instant) (bytes/s)
* Upload this session (bytes)
* Upload rate (instant) (bytes/s)

### Metrics server setup

As per sample.env, there are two variables to configure for where the server binds to, `PROM_IP` and `PROM_PORT`. Defaults are `127.0.0.1` and `9999` respectively.
This address needs to be accessible by yur prometheus instance!

To run the server, it is recommended to use a node process manager, pm2. Install it with:

```sh
npm i -g pm2
```

Then you can start the server (from the project root) with:

```sh
pm2 start ./build/server/app.js --name=qbit-race-prom-exporter
```

(Replace name with something ele if you wish)

You can monitor the status with 

```sh
pm2 monit
```

### Example PromQL queries

TODO