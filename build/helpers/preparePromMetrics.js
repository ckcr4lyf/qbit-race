"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMetrics = void 0;
const makeMetrics = (transferInfo) => {
    let result = '';
    result += `qbit_dl_bytes ${transferInfo.dl_info_data}\n`;
    result += `qbit_dl_rate_bytes ${transferInfo.dl_info_speed}\n`;
    result += `qbit_ul_bytes ${transferInfo.up_info_data}\n`;
    result += `qbit_ul_rate_bytes ${transferInfo.up_info_speed}\n`;
    result += `up 1\n`;
    return result;
};
exports.makeMetrics = makeMetrics;
//# sourceMappingURL=preparePromMetrics.js.map