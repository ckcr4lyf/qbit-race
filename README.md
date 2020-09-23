# qBittorrent Racing

This repository is still in beta. There might be bugs. Feel free to open an issue if you encounter one

## Thanks

<center>

[<img src="https://user-images.githubusercontent.com/6680615/88460516-56eac500-cecf-11ea-8552-584eaaac5297.png" width="300">](https://clients.walkerservers.com/)

Massive Thanks to <a href="https://walkerservers.com/">WalkerServers</a> for sponsoring this project. Check them out for affordable, high performance dedicated servers!
</center>

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

Now open `.env` in an editor like nano or such, and change the valuesa s per your setup. `QBIT_PORT` is the port the Web UI is listening on, NOT the port for incoming BitTorrent connections.

Once you think you've done it correctly, Validate it by running

```
npm run validate
```

If all went well, you'll see something like

```
2020-09-23T16:03:26.215Z [CONFIG] - Loaded .env
2020-09-23T16:03:26.237Z [CONFIG] - Updated COOKIE to [redacted]
2020-09-23T16:03:26.237Z [AUTH] - Login completed in 0.01 seconds.
2020-09-23T16:03:26.237Z [TEST] - SUCCESS!
```

Once complete, you can move onto the autodl part.

## AutoDL setup

To get the path to the script which will feed qBittorrent, run the following commands:
```
cd ~/scripts/qbit-race/bin
echo "$(pwd)/autodl_feed.js"
```

You will see a line like
```
/home/username/scripts/qbit-race/bin/autodl_feed.js
```

This is the path to the script. Now in AutoDL, change the Action for your filter (or Global action) to:
```
Choose .torrent action - Run Program
Comamnd - /home/username/scripts/qbit-race/bin/autodl_feed.js
Arguments - "$(InfoHash)" "$(InfoName)" "$(Tracker)" "$(TorrentPathName)"
```

And click OK, and that should be it!

Now, when AutoDL geta a torrent, it will pass it to the script which will feed it to qBittorrent!

You can view the logs under `~/scripts/qbit-race/logs` to try and debug.