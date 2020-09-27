# qBittorrent Racing

`qbit-race` is a set of tools to help racing torrents on certain trackers. Some features are:

* Reannounce to tracker
* Automatically tag torrents with trackers
* Discord notifications on addition (w/ size, trackers)
* Discord notifications on completion (w/ ratio)
* Configuring the number of simultaneous races
* Pause seeding torrents when a new race is about to begin

This repository is still in beta. There might be bugs. Feel free to open an issue if you encounter one. 
You may also open an issue to request a feature, but please mark it with the prefix `[FEATURE REQUEST]`

You need node v12+ to run this. 

## Thanks

<center>

[<img src="https://user-images.githubusercontent.com/6680615/88460516-56eac500-cecf-11ea-8552-584eaaac5297.png" width="300">](https://clients.walkerservers.com/)

Massive Thanks to <a href="https://walkerservers.com/">WalkerServers</a> for sponsoring this project. Check them out for affordable, high performance dedicated servers!
</center>

## Node requirement
This project needs Node.js v12+.
### Important! 
If you have installed Node.js with nvm, you will need to symlink it to your `bin` directory. Usually local bin will do, otherwise you may need to symlink it to `/usr/bin`

You can get the correct command to symlink nvm's node by running these commands (The following commands print the symlink to execute, but doesn't actually run them)

```sh
echo "ln -s $(which node) ${HOME}/node"
```

or (this might need a sudo)
```sh
echo "ln -s $(which node) /usr/bin/node"
```

## Repo Setup

First, you need to download this repository, install some dependencies, and setup your enivronment variables file. 
You may run the following commands:

```
mkdir -p ~/scripts
cd ~/scripts
git clone https://github.com/ckcr4lyf/qbit-race.git
cd qbit-race
npm install
cp sample.env .env
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

## Additional Settings

There are additional parameters you can tweak in `settings.js`. These settings can be changed anytime by modifying this file, does not need a restart of qBittorrent or AutoDL. Here is a short explanation:

|Parameter|Default|Description|
|---------|-------|-----------|
|`REANNOUNCE_INTERVAL`|`5000`|milliseconds to wait before sending reannounce requests|
|`REANNOUNCE_LIMIT`|`30`|Number of times to reannounce to the tracker before "giving up" (sometimes a torrent may be announced but then deleted by moderation)|
|`PAUSE_RATIO`|`1`|When a new torrent is added, all seeding torrents above this ratio are paused. `-1` will not pause any torrents, this may lead to worse performance|
|`CONCURRENT_RACES`|`1`|How many torrents can be "raced" at once. If autodl grabs a torrent, but these many races are already in progress, the torrent will be silently skipped. While less parallel races give better performance, if you want to download everything autoDL grabs, set this to `-1`|
|`COUNT_STALLED_DOWNLOADS`|`false`|If a seeder abandons the torrent midway, the download may be stalled. This option controlls whether such torrents should be counted when checking for `CONCURRENT_RACES`. It is advisable to keep this as false|
|`DISCORD_NOTIFICATIONS`|`object`|See below for descripton|

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

## AutoDL setup

To get the path to the script which will feed qBittorrent, run the following commands:
```sh
cd ~/scripts/qbit-race/bin
echo "$(pwd)/autodl_feed.js"
```

You will see a line like
```
/home/username/scripts/qbit-race/bin/autodl_feed.js
```

This is the path to the script. Now in AutoDL, change the Action for your filter (or Global action) to:
1. Choose .torrent action - `Run Program`
2. Comamnd - `/home/username/scripts/qbit-race/bin/autodl_feed.js`
3. Arguments - `"$(InfoHash)" "$(InfoName)" "$(Tracker)" "$(TorrentPathName)"`

Click OK, and that should be it!

Now, when AutoDL geta a torrent, it will pass it to the script which will feed it to qBittorrent!

You can view the logs under `~/scripts/qbit-race/logs` to try and debug.

## qBittorrent post race setup

After the race, the post race script will resume the torrents (if nothing else is downloading), and also send you a discord notification with the ratio (if you have enabled it).

To get the path to the post race script, run the following commands:
```sh
cd ~/scripts/qbit-race/bin
echo "$(pwd)/post_race.js"
```

You will see a line like
```
/home/username/scripts/qbit-race/bin/post_race.js
```

This is the path to the script. Now open qBittorrent, and in that open settings. At the bottom of "Downloads", check "Run external program on torrent completion". 
In the textbox, enter that path to the script followed by `"%I" "%N" "%T"`.

So the final entry would look like
```
/home/username/scripts/qbit-race/bin/post_race.js "%I" "%N" "%T"
```