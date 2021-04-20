"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.humanFileSize = exports.sleep = void 0;
const sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
};
exports.sleep = sleep;
//Thanks mpen @ StackOverflow! - https://stackoverflow.com/a/14919494/3857675
const humanFileSize = (bytes, si = false, dp = 1) => {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + ' ' + units[u];
};
exports.humanFileSize = humanFileSize;
//# sourceMappingURL=utilities.js.map