import { TorrentState } from "../interfaces";
export const makeMetrics = (transferInfo) => {
    let result = '';
    result += `qbit_dl_bytes ${transferInfo.dl_info_data}\n`;
    result += `qbit_dl_rate_bytes ${transferInfo.dl_info_speed}\n`;
    result += `qbit_ul_bytes ${transferInfo.up_info_data}\n`;
    result += `qbit_ul_rate_bytes ${transferInfo.up_info_speed}\n`;
    result += `up 1\n\n`;
    return result;
};
export const countTorrentStates = (torrents) => {
    // Initialize counter to 0
    let stateCounter = {};
    for (let state in TorrentState) {
        stateCounter[state] = 0;
    }
    // Count all the states
    for (let torrent of torrents) {
        stateCounter[torrent.state]++;
    }
    return stateCounter;
};
export const stateMetrics = (torrents) => {
    let metrics = '';
    let stateCount = countTorrentStates(torrents);
    for (let state in stateCount) {
        metrics += `qbit_torrents_state{state="${state}"} ${stateCount[state]}\n`;
    }
    metrics += '\n';
    return metrics;
};
//# sourceMappingURL=preparePromMetrics.js.map