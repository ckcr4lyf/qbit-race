# WARNING

This repository is still in development. Use at your own risk

Don't @ me if you get 0 ratio

## Repo Setup


```
mkdir -p ~/scripts
cd ~/scripts
git clone https://github.com/ckcr4lyf/qbit-race.git
cd qbit-race
npm install
cp sample.env .env
```

Now open `.env` in an editor like nano or something, and change the values for username and password. Port should be `8080` unless you changed it.

Once complete, you can move onto the autodl part.

## AutoDL setup

In your filter, choose the action tab (or set it as global action). Select run program. 
In the repo folder, run `pwd` to get the complete path.

it should look like `/home/username/scripts/qbit-race/`. To the end of it, add on `tests/autodl_feed.js`, so it looks like

```
/home/username/scripts/qbit-race/tests/autodl_feed.js
```

For the arguments, enter:
```
"$(InfoHash)" "$(InfoName)" "$(Tracker)" "$(TorrentPathName)"
```

Enable. You should be good. There is no logging right now, so hope for the best. Worst case it wont add it, best case it will add and reannounce appropriately. 

# THIS IS NOT COMPLETE! 

If there is a clear bug (crashing etc) open an issue. Otherwise, be patient, I am ironing out the flow and adding features like discord notifications and logging!