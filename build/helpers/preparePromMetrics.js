"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateMetrics = exports.countTorrentStates = exports.makeMetrics = void 0;
const interfaces_1 = require("../interfaces");
const makeMetrics = (transferInfo) => {
    let result = '';
    result += `qbit_dl_bytes ${transferInfo.dl_info_data}\n`;
    result += `qbit_dl_rate_bytes ${transferInfo.dl_info_speed}\n`;
    result += `qbit_ul_bytes ${transferInfo.up_info_data}\n`;
    result += `qbit_ul_rate_bytes ${transferInfo.up_info_speed}\n`;
    result += `up 1\n\n`;
    return result;
};
exports.makeMetrics = makeMetrics;
const countTorrentStates = (torrents) => {
    // Initialize counter to 0
    let stateCounter = {};
    for (let state in interfaces_1.TorrentState) {
        stateCounter[state] = 0;
    }
    // Count all the states
    for (let torrent of torrents) {
        stateCounter[torrent.state]++;
    }
    return stateCounter;
};
exports.countTorrentStates = countTorrentStates;
const stateMetrics = (torrents) => {
    let metrics = '';
    let stateCount = (0, exports.countTorrentStates)(torrents);
    for (let state in stateCount) {
        metrics += `qbit_torrents_state{state="${state}"} ${stateCount[state]}\n`;
    }
    metrics += '\n';
    return metrics;
};
exports.stateMetrics = stateMetrics;
//# sourceMappingURL=preparePromMetrics.js.map