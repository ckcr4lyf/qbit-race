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

Please use Node.JS v18.6.0 or later. LTS v16 should work in most cases, but if you face bugs related to "Out of memory: wasm memory" ([more info](https://github.com/nodejs/node/pull/43612)) , please try Node v18.6.0 before creating an issue.

I would recommend using n for installing Node.JS (https://github.com/tj/n) .
### Important! 

The node binary needs to be accessible to `autodl-irssi` (or `autobrr`) and `qbittorrent`. On some seedboxes, the `PATH` for these is fixed, and usually includes a directory such as `~/bin` or `~/.local/bin`. In such cases you can symlink node to these, more details are below.

<details>

<summary> Symlinking Node on shared seedboxes </summary>

You can determine the path to node by running:

```
$ which node
```

For instance, if you install using `n`, it may be `/home/username/n/bin/node`. Then, symlink that into your bin folder:
```
ln -s PATH_TO_NODE ${HOME}/bin/node
```

For details on specific seedbox vendors, see (TODO).

</details>

<details>

<summary> Symlinking Node on dedicated seedboxes </summary>

Usually on dedicates seedboxes, the path you install node to, even via `n`, should be added to the user's path, and restarting applications (e.g. autodl, qbittorrent) should make this available in their path.

However, if it isn't, then you usually need to symlink it into `/usr/bin`. First determine the path to node:

```
$ which node
```

For instance, if you install using `n`, it may be `/home/username/n/bin/node`. Then, symlink that into `/usr/bin` as (this may need sudo):
```
ln -s PATH_TO_NODE /usr/bin/node
```

For details on specific seedbox vendors, see (TODO).

</details>

## Setup

**PLEASE NOTE : YOU ARE ON THE MASTER BRANCH, FOR V2 (ALPHA) OF QBIT-RACE! THIS RELEASE IS NOT YET STABLE.**

If you want to install the latest stable release, please checkout the README of v1.1.0: https://github.com/ckcr4lyf/qbit-race/tree/v1.1.0

If you want to try out V2 (alpha), then read ahead...

### Install qbit-race

Installing is as simple as `npm i -g qbit-race` 

### Post install setup

Run `qbit-race` once to generate a dummy config file.

Then you can edit the file in `~/.config/qbit-race/config.json` with the values you prefer.

## Configuration

Once you've initialized the config, you can tweak settings in `~/.config/qbit-race/config.json`. These settings can be changed anytime by modifying this file, and doing so does not need a restart of qBittorrent or AutoDL. Here is a short explanation of the options:

|Parameter|Default|Description|
|---------|-------|-----------|
|`REANNOUNCE_INTERVAL`|`5000`|milliseconds to wait before re-sending reannounce requests|
|`REANNOUNCE_LIMIT`|`30`|Number of times to reannounce to the tracker before "giving up" (sometimes a torrent may be uploaded but then deleted by moderation)|
|`PAUSE_RATIO`|`1`|When a new torrent is added, all seeding torrents above this ratio are paused. `-1` will not pause any torrents.  (This may lead to worse racing performance)|
|`PAUSE_SKIP_TAGS`|`["tracker.linux.org", "some_other_tag"]`|Prevent pausing of torrents before a race, if any of the tags match. This parameter is useful for skipping certain trackers where you may want to maintain seedtime|
|`PAUSE_SKIP_CATEGORIES`|`["permaseeding", "some_other_category"]`|Prevent pausing of torrents before a race, if the category matches any in this list. Useful if you setup autoDL with some filters with the category option, and want to skip them from being paused|
|`CONCURRENT_RACES`|`1`|How many torrents can be "raced" at once. If autodl grabs a torrent, but these many races are already in progress, the torrent will be silently skipped. While less parallel races give better performance, if you want to download everything autoDL grabs, set this to `-1`|
|`COUNT_STALLED_DOWNLOADS`|`false`|If a seeder abandons the torrent midway, the download may be stalled. This option controls whether such torrents should be counted when checking for `CONCURRENT_RACES`. It is advised to keep this as false|
|`QBITTORRENT_SETTINGS`|`object`|The connection options for qBittorrent. More details below|
|`DISCORD_NOTIFICATIONS`|`object`|Configuration for discord notifications. Check [this section](#discord-notifications) for more details|
|`CATEGORY_FINISH_CHANGE`|`object`|Check [this section](#change-category-on-torrent-completion) for details|

### Discord Notifications
<br><br>
This option allows you to configure a Discord Webhook URL for notifications on a torrent being added, as well as torrent completion.

|Parameter|Default|Description|
|---------|-------|-----------|
|`enabled`|`false`|Controls whether notifications are sent or not. Set to `true` to enable discord notifications|
|`webhook`|`""`|The URL for your discord webhook|
|`botUsername`|`qBittorrent`|The username of the Discord "account" that sends the notification|
|`botAvatar`|(qBittorrent logo)|The picture of the Discord "account" that sends notification, and thumbnail of the embed|

Once you enable webhooks, you can run `qbit-race validate` to check if it is able to send you a message in the channel.

### Change Category on torrent completion

Often it may be desirable to change the category of the torrent on completion, example when using with Sonarr / Radarr etc. It is also useful to move torrents from SSD to HDD, with qBittorrents category-based download path rules.  You can add as many rules as you would like (of course, a single torrent is limited to a single category still, by qbittorrent itself).

To do so, there are two requirements:
1. The torrent must be added with a category set ([see this section](#torrent-category))
2. The category *to be changed to* must already exist in qBittorrent

Then, in the configuration file, you can add a line to the `CATEGORY_FINISH_CHANGE` object, of the form:

```
'THE_CATEGORY_FROM_AUTODL': 'THE_CATEGORY_AFTER_COMPLETION'
```

For instance, if you add it with the category "DOWNLOADING_LINUX", and want to change to "SEEDING_LINUX" on completeion, you can set it up as:
```
CATEGORY_FINISH_CHANGE: {
     'DOWNLOADING_LINUX': 'SEEDING_LINUX',
     'ANOTHER_ONE': 'YET_ANOTHER_ONE'
}
```

## AutoDL setup (Basic)

Make sure you followed the steps to symlink node (if required). Detailed vendor-specific seedbox guides can be found here: (TODO)

To determine the path of `qbit-race`, run `which qbit-race`. You will see the complete path, for example `/home/username/n/bin/qbit-race`. This will be the command in the AutoDL config.

Now in AutoDL, change the Action for your filter (or Global action) to:
1. Choose .torrent action - `Run Program`
2. Comamnd - `/home/username/n/bin/qbit-race`
3. Arguments - `add -p "$(TorrentPathName)"`

TODO: Screencap

Click OK, and that should be it!

Now, when AutoDL gets a torrent, it will pass it to the script which will feed it to qBittorrent!

You can view the logs under `~/.config/qbit-race/logs.txt` to try and debug.

## AutoDL setup (Advanced)

**TODO: UPDATE FOR V2**

These are additional parameters you can specify in autoDL for additional functionality

### No Tracker Tags

By default, when adding the torrent, `qbit-race` also "tags" the torrent with the hostname of all trackers. This is mostly useful in older version of qBittorrent to be able to sort torrents by trackers.

To disable this, you can pass an extra flag `--no-tracker-tags` to the `qibt-race add` command.

### Torrent Category

In the autoDL arguments field, you may specify a category (per filter, or global) by adding to the end of arguments `--category "the category name"`

For instance, a filter for Arch Linux ISOs could have the arguments:
```
`"$(InfoHash)" "$(InfoName)" "$(Tracker)" "$(TorrentPathName)" --category "never open"`
```

Which would set the category of all torrents that match said filter to "never open". If the category doesn't exist it will be created automatically. 

Protip: qBittorrent has a feature that allows you to configure download paths by category. This might be useful to consolidate your downloads.

## autobrr setup (BETA)

**TODO: UPDATE FOR V2**

It should work with [autobrr](https://github.com/autobrr/autobrr) as well, for the arguments in autobrr, just put `{{ .TorrentPathName }}` , and the command to execute same as that for AutoDL (path to `qbit-race`). Advanced instructions for category etc. are similar.

## qBittorrent post race setup

**TODO: UPDATE FOR V2**

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

**TODO: UPDATE FOR V2**

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

In the config file, there are two keys under `PROMETHEUS_SETTINGS` to configure for where the server binds to, `ip` and `port`. Defaults are `127.0.0.1` and `9999` respectively.

This address needs to be accessible by yur prometheus instance!

To run the server, it is recommended to use a node process manager, pm2. Install it with:

```sh
npm i -g pm2
```

Then you can start the server (from the project root) with:

```sh
pm2 start "qbit-race metrics" --name=qbit-race-prom-exporter
```

(Replace name with something else if you wish)

You can monitor the status of th emetrics server with 

```sh
pm2 monit
```

Then add it to your Prometheus config, and should be good to go!

### Example PromQL queries

TODO